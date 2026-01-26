package pl.gogacz.smart_helpdesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.TicketHistory; // <--- NOWE
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.TicketHistoryRepository; // <--- NOWE
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketHistoryRepository historyRepository; // <--- NOWE

    // Aktualizacja konstruktora
    public TicketController(TicketRepository ticketRepository, UserRepository userRepository, TicketHistoryRepository historyRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }

    // Pomocnicza metoda do pobierania aktualnego użytkownika (tego co klika)
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        User currentUser = getCurrentUser();
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

    // --- NOWY ENDPOINT DO HISTORII ---
    @GetMapping("/{id}/history")
    public List<TicketHistory> getTicketHistory(@PathVariable Long id) {
        return historyRepository.findByTicketIdOrderByTimestampDesc(id);
    }
    // ---------------------------------

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

        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/status")
    public Ticket changeStatus(@PathVariable Long id, @RequestBody String status) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        User modifier = getCurrentUser();

        // Logika historii
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
    public Ticket changePriority(@PathVariable Long id, @RequestBody String priority) {
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
    public Ticket assignTicket(@PathVariable Long id, @RequestParam Long userId) {
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

    @PutMapping("/{id}/assign-me")
    public Ticket assignToMe(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        User modifier = getCurrentUser(); // Tutaj modyfikujący jest też nowym przypisanym

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

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        User currentUser = getCurrentUser();
        List<Ticket> allTickets = ticketRepository.findAll();

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

        return Map.of(
                "globalOpen", globalOpen,
                "globalTotal", globalTotal,
                "myOpen", myTickets.stream().filter(t -> "OPEN".equals(t.getStatus())).count(),
                "myInProgress", myTickets.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count(),
                "myClosed", myTickets.stream().filter(t -> "CLOSED".equals(t.getStatus())).count()
        );
    }
}