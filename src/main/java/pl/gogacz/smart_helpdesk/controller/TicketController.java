package pl.gogacz.smart_helpdesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.exception.ResourceNotFoundException;
import pl.gogacz.smart_helpdesk.model.Category;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.TicketHistory;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.model.enums.TicketPriority;
import pl.gogacz.smart_helpdesk.model.enums.TicketStatus;
import pl.gogacz.smart_helpdesk.repository.CategoryRepository;
import pl.gogacz.smart_helpdesk.repository.TicketHistoryRepository;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;
import pl.gogacz.smart_helpdesk.service.EmailService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketHistoryRepository historyRepository;
    private final CategoryRepository categoryRepository;
    private final EmailService emailService;

    public TicketController(TicketRepository ticketRepository,
                            UserRepository userRepository,
                            TicketHistoryRepository historyRepository,
                            CategoryRepository categoryRepository,
                            EmailService emailService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.categoryRepository = categoryRepository;
        this.emailService = emailService;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono zalogowanego użytkownika: " + auth.getName()));
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
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono zgłoszenia o ID: " + id));
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/{id}/history")
    public List<TicketHistory> getTicketHistory(@PathVariable Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Nie znaleziono zgłoszenia o ID: " + id);
        }
        return historyRepository.findByTicketIdOrderByTimestampDesc(id);
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        User author = getCurrentUser();

        ticket.setAuthor(author);
        ticket.setCreatedDate(LocalDateTime.now());
        ticket.setLastUpdated(LocalDateTime.now());
        ticket.setStatus(TicketStatus.OPEN);

        // --- AUTOMATYCZNY PRIORYTET (Ignorujemy to co przysłał frontend) ---
        if (author.getDefaultPriority() != null) {
            try {
                ticket.setPriority(TicketPriority.valueOf(author.getDefaultPriority()));
            } catch (Exception e) {
                ticket.setPriority(TicketPriority.NORMAL);
            }
        } else {
            ticket.setPriority(TicketPriority.NORMAL);
        }

        // --- NAPRAWA KATEGORII (Obsługa obiektu Category) ---
        // 1. Pobieramy nazwę kategorii (z obiektu lub domyślnie "Inne")
        String catName = "Inne";
        if (ticket.getCategory() != null && ticket.getCategory().getName() != null) {
            catName = ticket.getCategory().getName();
        }

        // 2. Znajdujemy w bazie lub tworzymy nową (żeby uniknąć błędu 500 FK)
        String finalCatName = catName;
        Category category = categoryRepository.findByName(finalCatName)
                .orElseGet(() -> categoryRepository.save(new Category(finalCatName)));

        ticket.setCategory(category);
        // ---------------------------------------------------

        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/status")
    public Ticket changeStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        TicketStatus newStatus;
        try {
            newStatus = TicketStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Nieznany status: " + statusStr);
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono zgłoszenia o ID: " + id));

        User modifier = getCurrentUser();
        TicketStatus oldStatus = ticket.getStatus();

        if (oldStatus != newStatus) {
            TicketHistory history = new TicketHistory(ticket, modifier, "STATUS_CHANGE", oldStatus.name(), newStatus.name());
            historyRepository.save(history);

            // Powiadomienie E-mail (bezpieczne)
            try {
                if (emailService != null) {
                    emailService.sendStatusChangeEmail(ticket.getAuthor().getEmail(), ticket.getId(), newStatus.name());
                }
            } catch (Exception e) {
                // Logujemy błąd ale nie przerywamy requestu
                System.err.println("Błąd wysyłki maila: " + e.getMessage());
            }
        }

        ticket.setStatus(newStatus);
        ticket.setLastUpdated(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/priority")
    public Ticket changePriority(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String priorityStr = body.get("priority");
        TicketPriority newPriority;
        try {
            newPriority = TicketPriority.valueOf(priorityStr);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Nieznany priorytet: " + priorityStr);
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono zgłoszenia o ID: " + id));

        User modifier = getCurrentUser();
        TicketPriority oldPriority = ticket.getPriority();
        String oldPriorityName = oldPriority != null ? oldPriority.name() : "BRAK";

        if (oldPriority != newPriority) {
            TicketHistory history = new TicketHistory(ticket, modifier, "PRIORITY_CHANGE", oldPriorityName, newPriority.name());
            historyRepository.save(history);
        }

        ticket.setPriority(newPriority);
        ticket.setLastUpdated(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/assign")
    public Ticket assignTicket(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono zgłoszenia o ID: " + id));

        User staff = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono pracownika o ID: " + userId));

        User modifier = getCurrentUser();
        String oldAssignee = ticket.getAssignedUser() != null ? ticket.getAssignedUser().getUsername() : "Brak";

        if (!oldAssignee.equals(staff.getUsername())) {
            TicketHistory history = new TicketHistory(ticket, modifier, "ASSIGNMENT_CHANGE", oldAssignee, staff.getUsername());
            historyRepository.save(history);
        }

        ticket.setAssignedUser(staff);
        ticket.setLastUpdated(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/category")
    public Ticket changeCategory(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String categoryName = body.get("category");

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono zgłoszenia o ID: " + id));

        User modifier = getCurrentUser();
        String oldCategoryName = ticket.getCategory() != null ? ticket.getCategory().getName() : "Brak";

        Category newCategory = categoryRepository.findByName(categoryName)
                .orElseGet(() -> categoryRepository.save(new Category(categoryName)));

        if (!oldCategoryName.equals(newCategory.getName())) {
            TicketHistory history = new TicketHistory(ticket, modifier, "CATEGORY_CHANGE", oldCategoryName, newCategory.getName());
            historyRepository.save(history);
        }

        ticket.setCategory(newCategory);
        ticket.setLastUpdated(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @PutMapping("/{id}/assign-me")
    public Ticket assignToMe(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono zgłoszenia o ID: " + id));

        User modifier = getCurrentUser();
        String oldAssignee = ticket.getAssignedUser() != null ? ticket.getAssignedUser().getUsername() : "Brak";

        if (!oldAssignee.equals(modifier.getUsername())) {
            TicketHistory history = new TicketHistory(ticket, modifier, "ASSIGNMENT_CHANGE", oldAssignee, modifier.getUsername());
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
                .collect(Collectors.toList());
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());

        Map<String, Object> response = new java.util.HashMap<>();
        List<Ticket> allTickets = ticketRepository.findAll();

        long globalOpen = allTickets.stream().filter(t -> TicketStatus.OPEN.equals(t.getStatus())).count();
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
        response.put("myOpen", myTickets.stream().filter(t -> TicketStatus.OPEN.equals(t.getStatus())).count());
        response.put("myInProgress", myTickets.stream().filter(t -> TicketStatus.IN_PROGRESS.equals(t.getStatus())).count());
        response.put("myClosed", myTickets.stream().filter(t -> TicketStatus.CLOSED.equals(t.getStatus())).count());

        if (isAdmin) {
            try {
                // Te metody wymagają odpowiedniego zapytania w TicketRepository
                // Jeśli ich nie masz, zakomentuj te linie:
                List<Object[]> userResults = ticketRepository.countClosedTicketsByUser();
                response.put("users", userResults.stream().map(row -> Map.of("label", row[0], "value", row[1])).collect(Collectors.toList()));

                List<Object[]> categoryResults = ticketRepository.countTicketsByCategory();
                response.put("categories", categoryResults.stream().map(row -> Map.of("label", row[0], "value", row[1])).collect(Collectors.toList()));
            } catch (Exception e) {
                response.put("users", List.of());
                response.put("categories", List.of());
            }
        } else {
            response.put("users", List.of());
            response.put("categories", List.of());
        }

        return response;
    }
}