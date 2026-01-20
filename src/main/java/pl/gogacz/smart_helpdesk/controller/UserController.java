package pl.gogacz.smart_helpdesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // --- ZMIANA NA hasAnyRole ---
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // --- ZMIANA NA hasAnyRole ---
    @PutMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<User> changeRole(@PathVariable Long id, @RequestBody String role) {
        return userRepository.findById(id).map(user -> {
            String cleanRole = role.replace("\"", "").trim();
            user.setRole(cleanRole);
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ZMIANA NA hasAnyRole ---
    @PutMapping("/{id}/default-priority")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<User> changeDefaultPriority(@PathVariable Long id, @RequestBody String priority) {
        return userRepository.findById(id).map(user -> {
            String cleanPriority = priority.replace("\"", "").trim();
            user.setDefaultPriority(cleanPriority);
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ZMIANA NA hasAnyRole ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}