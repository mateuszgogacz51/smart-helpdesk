package pl.gogacz.smart_helpdesk.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // 1. POBIERANIE LISTY ZGŁOSZEŃ
    @GetMapping
    public List<Ticket> getTickets() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().toString(); // np. [ROLE_USER] lub [ROLE_ADMIN]
        String username = auth.getName();

        // Jeśli to zwykły USER, widzi tylko swoje zgłoszenia
        if (role.contains("USER") && !role.contains("HELPDESK") && !role.contains("ADMIN")) {
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));
            return ticketRepository.findByAuthor(currentUser);
        }

        // Helpdesk i Admin widzą wszystko
        return ticketRepository.findAll();
    }

    // 2. SZCZEGÓŁY ZGŁOSZENIA
    @GetMapping("/{id}")
    public Ticket getTicket(@PathVariable Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zgłoszenia o ID: " + id));
    }

    // 3. TWORZENIE ZGŁOSZENIA
    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ticket.setAuthor(currentUser);
        ticket.setCreatedDate(LocalDateTime.now());
        ticket.setStatus("OPEN"); // Domyślny status

        return ticketRepository.save(ticket);
    }

    // 4. PRZYPISYWANIE ZGŁOSZENIA
    // A) Przypisz do mnie (uproszczone)
    @PutMapping("/{id}/assign")
    public Ticket assignTicketToMe(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAssignedUser(currentUser);
        ticket.setStatus("IN_PROGRESS"); // Automatycznie zmieniamy na W TRAKCIE
        ticket.setLastUpdated(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    // B) Przypisz do innej osoby (dla Admina/Managera)
    @PutMapping("/{id}/assign/{userId}")
    public Ticket assignTicketToUser(@PathVariable Long id, @PathVariable Long userId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User staff = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ticket.setAssignedUser(staff);
        ticket.setStatus("IN_PROGRESS");
        ticket.setLastUpdated(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    // 5. ZMIANA STATUSU
    @PutMapping("/{id}/status")
    public Ticket updateTicketStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String newStatus = body.get("status");
        if (newStatus != null) {
            ticket.setStatus(newStatus);
            ticket.setLastUpdated(LocalDateTime.now());
        }

        return ticketRepository.save(ticket);
    }

    // 6. LISTA PRACOWNIKÓW (do dropdowna)
    @GetMapping("/staff")
    public List<User> getSupportStaff() {
        // Zwracamy wszystkich, którzy mają rolę HELPDESK lub ADMIN
        // To jest uproszczone, w SQL można by zrobić WHERE role IN (...)
        return userRepository.findAll().stream()
                .filter(u -> "HELPDESK".equals(u.getRole()) || "ADMIN".equals(u.getRole()))
                .toList();
    }

    // 7. STATYSTYKI (Dla Dashboardu) - TO JEST NOWA METODA
    @GetMapping("/stats")
    public Map<String, Long> getTicketStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));

        Map<String, Long> stats = new HashMap<>();

        // A. OGÓLNE (Globalne w firmie)
        stats.put("globalTotal", ticketRepository.count());
        stats.put("globalOpen", ticketRepository.countByStatus("OPEN"));
        stats.put("globalInProgress", ticketRepository.countByStatus("IN_PROGRESS"));
        stats.put("globalClosed", ticketRepository.countByStatus("CLOSED"));

        // B. MOJE (Przypisane do mnie)
        stats.put("myTotal", ticketRepository.countByAssignedUser(currentUser));
        stats.put("myOpen", ticketRepository.countByAssignedUserAndStatus(currentUser, "OPEN"));
        stats.put("myInProgress", ticketRepository.countByAssignedUserAndStatus(currentUser, "IN_PROGRESS"));
        stats.put("myClosed", ticketRepository.countByAssignedUserAndStatus(currentUser, "CLOSED"));

        return stats;
    }
}