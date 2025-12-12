package pl.gogacz.smart_helpdesk.controller;

import org.springframework.web.bind.annotation.*;
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

    // 1. Pobieranie wszystkich zgłoszeń
    @GetMapping
    public List<Ticket> getAllTickets() {
        return repository.findAll();
    }

    // 2. Pobieranie jednego zgłoszenia po ID
    @GetMapping("/{id}")
    public Ticket getTicket(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    // 3. Tworzenie zgłoszenia
    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        ticket.setId(null);
        return repository.save(ticket);
    }

    // 4. Aktualizacja
    @PutMapping("/{id}")
    public Ticket updateTicket(@PathVariable Long id, @RequestBody Ticket ticketDetails) {
        Ticket ticket = repository.findById(id).orElse(null);
        if (ticket != null) {
            ticket.setDescription(ticketDetails.getDescription());
            ticket.setStatus(ticketDetails.getStatus());
            ticket.setTitle(ticketDetails.getTitle());
            return repository.save(ticket);
        }
        return null;
    }

    // 5. Usuwanie
    @DeleteMapping("/{id}")
    public void deleteTicket(@PathVariable Long id) {
        repository.deleteById(id);
    }

    // 6. Filtrowanie po statusie
    @GetMapping("/status/{status}")
    public List<Ticket> getTicketsByStatus(@PathVariable String status) {
        return repository.findByStatus(status);
    }
    // 7. Wyszukiwarka po frazie (np. /api/tickets/search?title=myszka)
    @GetMapping("/search")
    public List<Ticket> searchTickets(@RequestParam String title) {
        return repository.findByTitleContainingIgnoreCase(title);
    }
}