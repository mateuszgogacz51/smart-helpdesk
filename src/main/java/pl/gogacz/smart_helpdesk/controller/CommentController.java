package pl.gogacz.smart_helpdesk.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Comment;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.CommentRepository;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController { // BRAK @CrossOrigin

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public CommentController(CommentRepository commentRepository, TicketRepository ticketRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/ticket/{ticketId}")
    public List<Comment> getCommentsByTicket(@PathVariable Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedDateAsc(ticketId);
    }

    @PostMapping("/ticket/{ticketId}")
    public Comment addComment(@PathVariable Long ticketId, @RequestBody Map<String, String> payload) {
        String content = payload.get("content");
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Treść pusta");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User author = userRepository.findByUsername(auth.getName()).orElseThrow();
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setCreatedDate(LocalDateTime.now());
        comment.setAuthor(author);
        comment.setTicket(ticket);

        ticket.setLastUpdated(LocalDateTime.now());
        ticketRepository.save(ticket);

        return commentRepository.save(comment);
    }
}