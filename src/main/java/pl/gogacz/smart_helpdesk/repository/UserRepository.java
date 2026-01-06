package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gogacz.smart_helpdesk.model.User;
import java.util.Optional; // <--- Ważny import

public interface UserRepository extends JpaRepository<User, Long> {

    // Tej metody brakuje, dlatego TicketController rzuca błąd:
    Optional<User> findByUsername(String username);
}