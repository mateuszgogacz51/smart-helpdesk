package pl.gogacz.smart_helpdesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Comment;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.CommentRepository;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:4200")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository, CommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    @GetMapping
    public List<Ticket> getAllTickets(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        if (user.getRole().equals("USER") || user.getRole().equals("BOARD")) {
            return ticketRepository.findByAuthor(user);
        }
        return ticketRepository.findAll();
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Map<String, Long> stats = new HashMap<>();

        long myOpen = ticketRepository.countByAssignedUserAndStatus(user, "OPEN");
        long myInProgress = ticketRepository.countByAssignedUserAndStatus(user, "IN_PROGRESS");
        long myClosed = ticketRepository.countByAssignedUserAndStatus(user, "CLOSED");
        long myTotal = myOpen + myInProgress + myClosed;

        stats.put("myOpen", myOpen);
        stats.put("myInProgress", myInProgress);
        stats.put("myClosed", myClosed);
        stats.put("myTotal", myTotal);

        stats.put("globalUnassigned", ticketRepository.countByAssignedUserIsNull());
        stats.put("globalOpen", ticketRepository.countByStatus("OPEN"));
        stats.put("globalInProgress", ticketRepository.countByStatus("IN_PROGRESS"));
        stats.put("globalClosed", ticketRepository.countByStatus("CLOSED"));
        stats.put("globalTotal", ticketRepository.count());

        return stats;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long id) {
        return ticketRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket, Authentication authentication) {
        String username = authentication.getName();
        User author = userRepository.findByUsername(username).orElseThrow();

        ticket.setAuthor(author);
        ticket.setStatus("OPEN");
        ticket.setCreatedDate(LocalDateTime.now());
        ticket.setLastUpdated(LocalDateTime.now());

        if (author.getDefaultPriority() != null && !author.getDefaultPriority().isEmpty()) {
            ticket.setPriority(author.getDefaultPriority());
        } else if ("BOARD".equals(author.getRole())) {
            ticket.setPriority("HIGH");
        } else {
            ticket.setPriority("NORMAL");
        }

        return ticketRepository.save(ticket);
    }

    // --- ZMIANA NA hasAnyRole ---
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELPDESK')")
    public ResponseEntity<Ticket> changeStatus(@PathVariable Long id, @RequestBody String status) {
        return ticketRepository.findById(id).map(ticket -> {
            String cleanStatus = status.replace("\"", "").trim();
            ticket.setStatus(cleanStatus);
            ticket.setLastUpdated(LocalDateTime.now());
            return ResponseEntity.ok(ticketRepository.save(ticket));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ZMIANA NA hasAnyRole ---
    @PutMapping("/{id}/priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELPDESK')")
    public ResponseEntity<Ticket> changePriority(@PathVariable Long id, @RequestBody String priority) {
        return ticketRepository.findById(id).map(ticket -> {
            String cleanPriority = priority.replace("\"", "").trim();
            ticket.setPriority(cleanPriority);
            ticket.setLastUpdated(LocalDateTime.now());
            return ResponseEntity.ok(ticketRepository.save(ticket));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ZMIANA NA hasAnyRole ---
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELPDESK')")
    public ResponseEntity<Ticket> assignTicket(@PathVariable Long id, @RequestParam Long userId) {
        return ticketRepository.findById(id).map(ticket -> {
            User staff = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ticket.setAssignedUser(staff);
            ticket.setLastUpdated(LocalDateTime.now());
            return ResponseEntity.ok(ticketRepository.save(ticket));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ZMIANA NA hasAnyRole ---
    @PutMapping("/{id}/assign-me")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELPDESK')")
    public ResponseEntity<Ticket> assignToMe(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setAssignedUser(currentUser);
            ticket.setLastUpdated(LocalDateTime.now());
            return ResponseEntity.ok(ticketRepository.save(ticket));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return commentRepository.findByTicketIdOrderByCreatedDateAsc(id);
    }

    @PostMapping("/{id}/comments")
    public Comment addComment(@PathVariable Long id, @RequestBody String content, Authentication authentication) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        User author = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setCreatedDate(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    // --- ZMIANA NA hasAnyRole ---
    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELPDESK')")
    public List<User> getSupportStaff() {
        return userRepository.findAll().stream()
                .filter(u -> !u.getRole().equals("USER") && !u.getRole().equals("BOARD"))
                .toList();
    }
}