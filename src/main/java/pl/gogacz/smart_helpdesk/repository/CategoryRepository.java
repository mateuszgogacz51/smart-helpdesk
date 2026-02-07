package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gogacz.smart_helpdesk.model.Category;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Potrzebne do znajdowania kategorii, gdy frontend wysyła nazwę
    Optional<Category> findByName(String name);
}