package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gogacz.smart_helpdesk.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    // Tu na razie pusto, standardowe metody (save, findAll) wystarczą
}