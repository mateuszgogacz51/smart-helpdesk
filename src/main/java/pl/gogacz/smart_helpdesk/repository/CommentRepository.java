package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.gogacz.smart_helpdesk.model.Comment;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Znajdź komentarze dla konkretnego zgłoszenia, posortowane od najstarszych
    List<Comment> findByTicketIdOrderByCreatedDateAsc(Long ticketId);
}