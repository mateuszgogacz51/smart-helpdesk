package pl.gogacz.smart_helpdesk.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:4200")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();

        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> {
                    String r = a.getAuthority();
                    return r.equals("ROLE_ADMIN") || r.equals("ADMIN") ||
                            r.equals("ROLE_HELPDESK") || r.equals("HELPDESK");
                });

        if (isStaff) {
            return ticketRepository.findAll();
        } else {
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));
            return ticketRepository.findByAuthor(currentUser);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long id) {
        return ticketRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User author = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));

        ticket.setAuthor(author);
        ticket.setCreatedDate(LocalDateTime.now());
        ticket.setLastUpdated(LocalDateTime.now());
        ticket.setStatus("OPEN");

        // AUTOMATYZACJA PRIORYTETU
        // Jeśli użytkownik ma ustawiony domyślny priorytet (np. HIGH), używamy go.
        if (author.getDefaultPriority() != null) {
            ticket.setPriority(author.getDefaultPriority());
        } else {
            ticket.setPriority("NORMAL");
        }

        return ticketRepository.save(ticket);
    }

    // --- Reszta metod bez zmian (changeStatus, changePriority, assign) ---
    // Dla pewności, że plik jest kompletny:

    @PutMapping("/{id}/status")
    public Ticket changeStatus(@PathVariable Long id, @RequestBody String status) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setStatus(status);
            ticket.setLastUpdated(LocalDateTime.now());
            return ticketRepository.save(ticket);
        }).orElseThrow();
    }

    @PutMapping("/{id}/priority")
    public Ticket changePriority(@PathVariable Long id, @RequestBody String priority) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setPriority(priority);
            ticket.setLastUpdated(LocalDateTime.now());
            return ticketRepository.save(ticket);
        }).orElseThrow();
    }

    @PutMapping("/{id}/assign")
    public Ticket assignTicket(@PathVariable Long id, @RequestParam Long userId) {
        User staff = userRepository.findById(userId).orElseThrow();
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setAssignedUser(staff);
            ticket.setLastUpdated(LocalDateTime.now());
            return ticketRepository.save(ticket);
        }).orElseThrow();
    }

    @PutMapping("/{id}/assign-me")
    public Ticket assignToMe(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User staff = userRepository.findByUsername(auth.getName()).orElseThrow();
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setAssignedUser(staff);
            ticket.setLastUpdated(LocalDateTime.now());
            return ticketRepository.save(ticket);
        }).orElseThrow();
    }

    @GetMapping("/staff")
    public List<User> getSupportStaff() {
        return userRepository.findAll().stream()
                .filter(u -> "HELPDESK".equals(u.getRole()) || "ADMIN".equals(u.getRole()))
                .toList();
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return Map.of(
                "open", ticketRepository.findAll().stream().filter(t -> "OPEN".equals(t.getStatus())).count(),
                "inProgress", ticketRepository.findAll().stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count(),
                "closed", ticketRepository.findAll().stream().filter(t -> "CLOSED".equals(t.getStatus())).count()
        );
    }
}