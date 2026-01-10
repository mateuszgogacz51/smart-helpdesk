package pl.gogacz.smart_helpdesk.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            // 1. ADMIN (Bez zmian)
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                admin.setFirstName("Administrator");
                userRepository.save(admin);
            }

            // 2. TOMEK - NOWY PRACOWNIK HELPDESKU (Zamiast Marka)
            if (userRepository.findByUsername("tomek").isEmpty()) {
                User tomek = new User();
                tomek.setUsername("tomek");
                tomek.setPassword(passwordEncoder.encode("tomek123"));
                tomek.setRole("HELPDESK"); // <--- TO JEST KLUCZOWE
                tomek.setFirstName("Tomek");
                tomek.setLastName("Obsługa");
                userRepository.save(tomek);
                System.out.println(">>> UTWORZONO UŻYTKOWNIKA: TOMEK (HELPDESK) <<<");
            }

            // 3. JAN - ZWYKŁY USER
            if (userRepository.findByUsername("jan").isEmpty()) {
                User jan = new User();
                jan.setUsername("jan");
                jan.setPassword(passwordEncoder.encode("jan123"));
                jan.setRole("USER");
                jan.setFirstName("Jan");
                jan.setLastName("Kowalski");
                userRepository.save(jan);
            }
        };
    }
}