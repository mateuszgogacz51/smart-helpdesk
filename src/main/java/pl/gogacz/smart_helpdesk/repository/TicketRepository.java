package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByAuthor(User author);

    // Liczy zadania przypisane do konkretnego usera
    long countByAssignedUserAndStatus(User assignedUser, String status);

    // Liczy zadania bez właściciela
    long countByAssignedUserIsNull();

    // --- NOWOŚĆ: Liczy globalnie po statusie (dla całej firmy) ---
    long countByStatus(String status);
}