package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pl.gogacz.smart_helpdesk.model.User;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    // Pobierz wszystkich, którzy NIE są zwykłymi userami (czyli Admin i Helpdesk)
    @Query("SELECT u FROM User u WHERE u.role IN ('ADMIN', 'HELPDESK')")
    List<User> findAllStaff();
}