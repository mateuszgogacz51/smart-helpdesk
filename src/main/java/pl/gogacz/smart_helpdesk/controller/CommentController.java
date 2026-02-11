package pl.gogacz.smart_helpdesk.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Comment;
import pl.gogacz.smart_helpdesk.service.CommentService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    // Wstrzykujemy TYLKO serwis. Repozytoria są teraz w serwisie.
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/ticket/{ticketId}")
    public List<Comment> getCommentsByTicket(@PathVariable Long ticketId) {
        return commentService.getComments(ticketId);
    }

    @PostMapping("/ticket/{ticketId}")
    public Comment addComment(@PathVariable Long ticketId, @RequestBody Map<String, String> payload) {
        String content = payload.get("content");

        // Pobieramy login zalogowanego użytkownika
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        // Zlecamy całą robotę (zapis + mail) do serwisu
        return commentService.addComment(ticketId, content, username);
    }
}