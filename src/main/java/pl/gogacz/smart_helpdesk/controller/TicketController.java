package pl.gogacz.smart_helpdesk.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:4200") // Pozwalamy Angularowi na dostęp
public class TicketController {

    // Tutaj nazywamy zmienną "repository"
    private final TicketRepository repository;

    public TicketController(TicketRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Ticket getTicket(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    public Ticket createTicket(@Valid @RequestBody Ticket ticket) {
        ticket.setId(null);
        return repository.save(ticket);
    }

    // --- TO JEST TA METODA, KTÓRA ROBIŁA BŁĘDY ---
    @PutMapping("/{id}")
    public Ticket updateTicket(@PathVariable Long id, @RequestBody Ticket ticket) {
        ticket.setId(id);
        // TERAZ JEST DOBRZE: używamy "repository", tak jak na górze pliku
        return repository.save(ticket);
    }
    // ----------------------------------------------

    @DeleteMapping("/{id}")
    public void deleteTicket(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @GetMapping("/status/{status}")
    public List<Ticket> getTicketsByStatus(@PathVariable String status) {
        return repository.findByStatus(status);
    }

    @GetMapping("/search")
    public List<Ticket> searchTickets(@RequestParam String title) {
        return repository.findByTitleContainingIgnoreCase(title);
    }
}