package pl.gogacz.smart_helpdesk.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByAuthor(User author);

    // Metoda do znajdowania przypisanych do konkretnego usera
    List<Ticket> findByAssignedUser(User assignedUser);

    List<Ticket> findByStatus(String status);
    List<Ticket> findByTitleContainingIgnoreCase(String title);

    // --- METODY DO STATYSTYK (LICZNIKI) ---

    // 1. Ogólne (dla całej firmy)
    long countByStatus(String status);

    // 2. Moje (przypisane do mnie)
    long countByAssignedUser(User assignedUser);
    long countByAssignedUserAndStatus(User assignedUser, String status);
}