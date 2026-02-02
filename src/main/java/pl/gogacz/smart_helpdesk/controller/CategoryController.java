package pl.gogacz.smart_helpdesk.controller;

import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Category;
import pl.gogacz.smart_helpdesk.repository.CategoryRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
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
    public void deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
    }
}