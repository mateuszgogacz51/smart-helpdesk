package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByAuthor(User author);

    // Liczy zadania przypisane do konkretnego usera o danym statusie
    long countByAssignedUserAndStatus(User assignedUser, String status);

    // Liczy wszystkie zadania w systemie
    long count();

    // --- NOWOŚĆ: Liczy zadania, które NIE MAJĄ nikogo przypisanego (Do wzięcia) ---
    long countByAssignedUserIsNull();
}