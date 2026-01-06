package pl.gogacz.smart_helpdesk.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByAuthor(User author);
    List<Ticket> findByStatus(String status);
    List<Ticket> findByTitleContainingIgnoreCase(String title);
}