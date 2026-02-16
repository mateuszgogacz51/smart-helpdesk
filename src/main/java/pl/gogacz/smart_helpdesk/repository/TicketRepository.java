package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Dla zwykłego Usera: widzi tylko swoje
    List<Ticket> findByAuthor(User author);

    // --- NOWE ZAPYTANIA DLA ADMINA (STATYSTYKI) ---

    // 1. Skuteczność serwisantów (ile zamknęli zgłoszeń)
    @Query("SELECT t.assignedUser.username, COUNT(t) " +
            "FROM Ticket t " +
            "WHERE t.status = 'CLOSED' AND t.assignedUser IS NOT NULL " +
            "GROUP BY t.assignedUser.username")
    List<Object[]> countClosedTicketsByUser();

    // 2. Popularność kategorii
    @Query("SELECT c.name, COUNT(t) " +
            "FROM Ticket t JOIN t.category c " +
            "GROUP BY c.name")
    List<Object[]> countTicketsByCategory();
}