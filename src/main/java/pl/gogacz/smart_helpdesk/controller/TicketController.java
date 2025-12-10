package pl.gogacz.smart_helpdesk.controller;

import org.springframework.web.bind.annotation.*; // Tu się zmieniło na gwiazdkę, żeby było krócej
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository repository;

    public TicketController(TicketRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return repository.findAll();
    }

    // --- TO DODAJESZ TERAZ ---
    @GetMapping("/{id}")
    public Ticket getTicket(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
}