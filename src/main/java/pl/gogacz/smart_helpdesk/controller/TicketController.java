package pl.gogacz.smart_helpdesk.controller;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // 1. POBIERANIE LISTY ZGŁOSZEŃ (z podziałem na role)
    @GetMapping
    public List<Ticket> getAllTickets() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika!"));

        // Logika uprawnień:
        if ("ADMIN".equals(currentUser.getRole()) || "HELPDESK".equals(currentUser.getRole())) {
            // Admin i Helpdesk widzą WSZYSTKO
            return ticketRepository.findAll();
        } else {
            // Zwykły pracownik widzi TYLKO SWOJE
            return ticketRepository.findByAuthor(currentUser);
        }
    }

    // 2. POBIERANIE JEDNEGO ZGŁOSZENIA (Szczegóły)
    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zgłoszenia o ID: " + id));
    }

    // 3. TWORZENIE NOWEGO ZGŁOSZENIA
    @PostMapping
    public Ticket createTicket(@Valid @RequestBody Ticket ticket) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();

        User author = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika!"));

        ticket.setAuthor(author);
        ticket.setCreatedDate(LocalDateTime.now());

        if (ticket.getStatus() == null) {
            ticket.setStatus("OPEN");
        }

        return ticketRepository.save(ticket);
    }

    // --- NOWE METODY DO DELEGOWANIA ---

    // 1. Pobierz listę pracowników (żeby Marek miał kogo wybrać z listy)
    @GetMapping("/staff")
    public List<User> getSupportStaff() {
        return userRepository.findAllStaff();
    }

    // 2. Przypisz zgłoszenie do KONKRETNEJ osoby (np. Marek przypisuje Robertowi)
    @PutMapping("/{id}/assign/{userId}")
    public Ticket assignTicketToUser(@PathVariable Long id, @PathVariable Long userId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zgłoszenia"));

        User targetEmployee = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono pracownika"));

        ticket.setAssignedUser(targetEmployee);
        ticket.setStatus("IN_PROGRESS"); // Automatyczna zmiana na "W toku"

        return ticketRepository.save(ticket);
    }

    // 4. ZMIANA STATUSU (np. "CLOSED") - Dla Helpdesku
    @PutMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zgłoszenia"));

        // Pobieramy status z obiektu JSON { "status": "CLOSED" }
        String newStatus = payload.get("status");

        if (newStatus != null) {
            ticket.setStatus(newStatus);
        }

        return ticketRepository.save(ticket);
    }

    // 5. PRZYPISANIE DO MNIE (Marek klika "Biorę to")
    @PutMapping("/{id}/assign")
    public Ticket assignTicket(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();

        User employee = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono pracownika"));

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zgłoszenia"));

        ticket.setAssignedUser(employee); // Przypisujemy obecnego użytkownika (Marka)
        ticket.setStatus("IN_PROGRESS");  // Automatycznie zmieniamy status na "W toku"

        return ticketRepository.save(ticket);
    }
}