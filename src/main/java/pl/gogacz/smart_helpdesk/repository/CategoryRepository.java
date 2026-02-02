package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gogacz.smart_helpdesk.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}