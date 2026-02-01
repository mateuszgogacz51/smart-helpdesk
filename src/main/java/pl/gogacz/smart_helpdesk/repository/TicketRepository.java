package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByAssignedUserId(Long userId);
    List<Ticket> findByAuthor(User author);
    List<Ticket> findByAssignedUserIdOrAuthorId(Long assignedId, Long authorId); // Opcjonalne, jeśli używasz

    // 1. Statystyki Pracowników (Posortowane malejąco)
    @Query("SELECT t.assignedUser.username, COUNT(t) FROM Ticket t WHERE t.status = 'CLOSED' AND t.assignedUser IS NOT NULL GROUP BY t.assignedUser.username ORDER BY COUNT(t) DESC")
    List<Object[]> countClosedTicketsByUser();

    // 2. Statystyki Kategorii (Posortowane malejąco - Najpopularniejsze na górze)
    @Query("SELECT t.category, COUNT(t) FROM Ticket t GROUP BY t.category ORDER BY COUNT(t) DESC")
    List<Object[]> countTicketsByCategory();
}