package pl.gogacz.smart_helpdesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Category;
import pl.gogacz.smart_helpdesk.repository.CategoryRepository;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final TicketRepository ticketRepository;

    public CategoryController(CategoryRepository categoryRepository,
                              TicketRepository ticketRepository) {
        this.categoryRepository = categoryRepository;
        this.ticketRepository = ticketRepository;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping
    public Category addCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        return categoryRepository.save(new Category(name));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        long count = ticketRepository.countByCategoryId(id);
        if (count > 0) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Nie można usunąć kategorii — przypisano do niej " + count + " zgłoszeń."));
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
