package pl.gogacz.smart_helpdesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByUsername(username).orElseThrow();

        // --- TU JEST NAPRAWA: Wysyłamy rolę do frontendu ---
        Map<String, String> response = new HashMap<>();
        response.put("username", user.getUsername());

        // Kluczowe: wysyłamy rolę, żeby przeglądarka wiedziała kim jesteś
        response.put("role", user.getRole());

        // Generujemy "token" (w uproszczeniu base64 z loginu:hasła)
        // W produkcji użyłbyś JWT, ale to wystarczy do działania
        String token = "Basic " + java.util.Base64.getEncoder()
                .encodeToString((username + ":" + password).getBytes());
        response.put("token", token);

        return ResponseEntity.ok(response);
    }
}