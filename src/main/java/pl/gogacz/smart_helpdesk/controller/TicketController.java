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
import java.util.stream.Collectors;

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
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HELPDESK"));

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

        // Automatyzacja priorytetu z encji User
        if (author.getDefaultPriority() != null) {
            ticket.setPriority(author.getDefaultPriority());
        } else {
            ticket.setPriority("NORMAL");
        }

        return ticketRepository.save(ticket);
    }

    // --- METODY DO EDYCJI ---
    @PutMapping("/{id}/status")
    public Ticket changeStatus(@PathVariable Long id, @RequestBody String status) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setStatus(status);
            ticket.setLastUpdated(LocalDateTime.now());
            return ticketRepository.save(ticket);
        }).orElseThrow(() -> new RuntimeException("Brak biletu"));
    }

    @PutMapping("/{id}/priority")
    public Ticket changePriority(@PathVariable Long id, @RequestBody String priority) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setPriority(priority);
            ticket.setLastUpdated(LocalDateTime.now());
            return ticketRepository.save(ticket);
        }).orElseThrow(() -> new RuntimeException("Brak biletu"));
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

    // --- POPRAWIONE STATYSTYKI ---
    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow();

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