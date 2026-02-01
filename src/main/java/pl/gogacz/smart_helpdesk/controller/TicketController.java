package pl.gogacz.smart_helpdesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.TicketHistory;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.TicketHistoryRepository;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketHistoryRepository historyRepository;

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository, TicketHistoryRepository historyRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        User currentUser = getCurrentUser();
        // Sprawdzenie czy użytkownik to ADMIN lub HELPDESK
        // Uwaga: Upewnij się, że w bazie role to "ADMIN", "HELPDESK" (bez ROLE_) - tak jak ustaliśmy wcześniej
        boolean isStaff = "ADMIN".equals(currentUser.getRole()) || "HELPDESK".equals(currentUser.getRole());

        if (isStaff) {
            return ticketRepository.findAll();
        } else {
            return ticketRepository.findByAuthor(currentUser);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long id) {
        return ticketRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/history")
    public List<TicketHistory> getTicketHistory(@PathVariable Long id) {
        return historyRepository.findByTicketIdOrderByTimestampDesc(id);
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        User author = getCurrentUser();

        ticket.setAuthor(author);
        ticket.setCreatedDate(LocalDateTime.now());
        ticket.setLastUpdated(LocalDateTime.now());
        ticket.setStatus("OPEN");

        if (author.getDefaultPriority() != null) {
            ticket.setPriority(author.getDefaultPriority());
        } else {
            ticket.setPriority("NORMAL");
        }

        // Zabezpieczenie przed brakiem kategorii
        if (ticket.getCategory() == null) {
            ticket.setCategory("Inne");
        }

        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/status")
    public Ticket changeStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        // Obsługa JSON: { "status": "CLOSED" }
        // Jeśli Twój frontend wysyła czysty string, można zmienić @RequestBody na String status
        String status = body.get("status");

        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        User modifier = getCurrentUser();

        String oldStatus = ticket.getStatus();
        if (!oldStatus.equals(status)) {
            TicketHistory history = new TicketHistory(ticket, modifier, "STATUS_CHANGE", oldStatus, status);
            historyRepository.save(history);
        }

        ticket.setStatus(status);
        ticket.setLastUpdated(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/priority")
    public Ticket changePriority(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String priority = body.get("priority");

        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        User modifier = getCurrentUser();

        String oldPriority = ticket.getPriority();
        if (oldPriority == null) oldPriority = "BRAK";

        if (!oldPriority.equals(priority)) {
            TicketHistory history = new TicketHistory(ticket, modifier, "PRIORITY_CHANGE", oldPriority, priority);
            historyRepository.save(history);
        }

        ticket.setPriority(priority);
        ticket.setLastUpdated(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/assign")
    public Ticket assignTicket(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");

        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        User staff = userRepository.findById(userId).orElseThrow();
        User modifier = getCurrentUser();

        String oldAssignee = ticket.getAssignedUser() != null ? ticket.getAssignedUser().getUsername() : "Brak";
        String newAssignee = staff.getUsername();

        if (!oldAssignee.equals(newAssignee)) {
            TicketHistory history = new TicketHistory(ticket, modifier, "ASSIGNMENT_CHANGE", oldAssignee, newAssignee);
            historyRepository.save(history);
        }

        ticket.setAssignedUser(staff);
        ticket.setLastUpdated(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/category")
    public Ticket changeCategory(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String category = body.get("category");

        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        User modifier = getCurrentUser(); // Metoda pomocnicza, którą już masz w klasie

        String oldCategory = ticket.getCategory();
        if (oldCategory == null) oldCategory = "Brak";

        if (!oldCategory.equals(category)) {
            // Logujemy zmianę w historii
            TicketHistory history = new TicketHistory(ticket, modifier, "CATEGORY_CHANGE", oldCategory, category);
            historyRepository.save(history);
        }

        ticket.setCategory(category);
        ticket.setLastUpdated(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
    @PutMapping("/{id}/assign-me")
    public Ticket assignToMe(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        User modifier = getCurrentUser();

        String oldAssignee = ticket.getAssignedUser() != null ? ticket.getAssignedUser().getUsername() : "Brak";
        String newAssignee = modifier.getUsername();

        if (!oldAssignee.equals(newAssignee)) {
            TicketHistory history = new TicketHistory(ticket, modifier, "ASSIGNMENT_CHANGE", oldAssignee, newAssignee);
            historyRepository.save(history);
        }

        ticket.setAssignedUser(modifier);
        ticket.setLastUpdated(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @GetMapping("/staff")
    public List<User> getSupportStaff() {
        return userRepository.findAll().stream()
                .filter(u -> "HELPDESK".equals(u.getRole()) || "ADMIN".equals(u.getRole()))
                .toList();
    }

    // --- ZMODYFIKOWANY ENDPOINT STATYSTYK ---
    // Łączy Twoje stare liczniki z nowymi danymi dla Admina
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());

        // Używamy HashMap<String, Object>, żeby móc wrzucić tam i Long, i Listy
        Map<String, Object> response = new HashMap<>();

        List<Ticket> allTickets = ticketRepository.findAll();

        // 1. Stare Liczniki (Globalne i Osobiste)
        long globalOpen = allTickets.stream().filter(t -> "OPEN".equals(t.getStatus())).count();
        long globalTotal = allTickets.size();

        boolean isStaff = "ADMIN".equals(currentUser.getRole()) || "HELPDESK".equals(currentUser.getRole());
        List<Ticket> myTickets;

        if (isStaff) {
            myTickets = allTickets.stream()
                    .filter(t -> t.getAssignedUser() != null && t.getAssignedUser().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        } else {
            myTickets = allTickets.stream()
                    .filter(t -> t.getAuthor().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }

        response.put("globalOpen", globalOpen);
        response.put("globalTotal", globalTotal);
        response.put("myOpen", myTickets.stream().filter(t -> "OPEN".equals(t.getStatus())).count());
        response.put("myInProgress", myTickets.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count());
        response.put("myClosed", myTickets.stream().filter(t -> "CLOSED".equals(t.getStatus())).count());

        // 2. Nowe Dane dla Admina (Wykresy)
        if (isAdmin) {
            // Statystyka Pracowników (Kto ile zamknął)
            List<Object[]> userResults = ticketRepository.countClosedTicketsByUser();
            List<Map<String, Object>> userStats = userResults.stream()
                    .map(row -> Map.of("label", row[0], "value", row[1]))
                    .collect(Collectors.toList());
            response.put("users", userStats);

            // Statystyka Kategorii (Popularność)
            List<Object[]> categoryResults = ticketRepository.countTicketsByCategory();
            List<Map<String, Object>> categoryStats = categoryResults.stream()
                    .map(row -> Map.of("label", row[0], "value", row[1]))
                    .collect(Collectors.toList());
            response.put("categories", categoryStats);
        } else {
            // Puste listy dla nie-admina (żeby frontend nie zgłaszał błędów undefined)
            response.put("users", List.of());
            response.put("categories", List.of());
        }

        return response;
    }
}