package pl.gogacz.smart_helpdesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')") // Teraz to zadziała, bo w Service też jest "ADMIN"
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Użytkownik o takim loginie już istnieje!");
        }

        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        if (user.getDefaultPriority() == null) user.setDefaultPriority("NORMAL");
        if (user.getRole() == null) user.setRole("USER");

        userRepository.save(user);
        return ResponseEntity.ok("Utworzono użytkownika");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        return userRepository.findById(id).map(user -> {
            if (updates.containsKey("username")) user.setUsername(updates.get("username"));
            if (updates.containsKey("firstName")) user.setFirstName(updates.get("firstName"));
            if (updates.containsKey("lastName")) user.setLastName(updates.get("lastName"));
            if (updates.containsKey("email")) user.setEmail(updates.get("email"));
            if (updates.containsKey("department")) user.setDepartment(updates.get("department"));
            if (updates.containsKey("role")) user.setRole(updates.get("role"));
            if (updates.containsKey("defaultPriority")) user.setDefaultPriority(updates.get("defaultPriority"));

            if (updates.containsKey("password") && !updates.get("password").isBlank()) {
                user.setPassword(passwordEncoder.encode(updates.get("password")));
            }

            userRepository.save(user);
            return ResponseEntity.ok("Zaktualizowano użytkownika");
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}