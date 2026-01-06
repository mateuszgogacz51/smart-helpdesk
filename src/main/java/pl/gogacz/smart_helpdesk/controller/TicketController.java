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
// Zezwalamy na połączenie z Angulara:
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // --- TO JEST METODA, KTÓRĄ NAPRAWIAMY ---
    @GetMapping
    public List<Ticket> getAllTickets() {
        // findAll() zwraca wszystko co jest w bazie.
        // Jeśli w SQL są dane, ta metoda MUSI je zwrócić.
        List<Ticket> tickets = ticketRepository.findAll();
        System.out.println("Backend wysyła do Angulara: " + tickets.size() + " zgłoszeń."); // Podgląd w konsoli
        return tickets;
    }
    // ----------------------------------------

    @PostMapping
    public Ticket createTicket(@Valid @RequestBody Ticket ticket) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();

        User author = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika!"));

        ticket.setAuthor(author);
        ticket.setCreatedDate(LocalDateTime.now());
        if (ticket.getStatus() == null) ticket.setStatus("OPEN");

        return ticketRepository.save(ticket);
    }
}