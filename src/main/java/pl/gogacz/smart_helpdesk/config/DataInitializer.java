package pl.gogacz.smart_helpdesk.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder; // <--- Import
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

@Configuration
public class DataInitializer {

    // Wstrzykujemy PasswordEncoder, żeby zakodować hasła przed zapisem
    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Sprawdzamy czy baza jest pusta, żeby nie dublować użytkowników
            if (userRepository.count() == 0) {

                // Tworzymy ADMINA
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin")); // <--- KODOWANIE HASŁA!
                admin.setRole("ADMIN");
                admin.setFirstName("Admin");
                admin.setLastName("Systemowy");
                userRepository.save(admin);

                // Tworzymy zwykłego użytkownika
                User user = new User();
                user.setUsername("user");
                user.setPassword(passwordEncoder.encode("user")); // <--- KODOWANIE HASŁA!
                user.setRole("USER");
                user.setFirstName("Jan");
                user.setLastName("Kowalski");
                userRepository.save(user);

                // Tworzymy pracownika Helpdesk
                User support = new User();
                support.setUsername("support");
                support.setPassword(passwordEncoder.encode("support")); // <--- KODOWANIE HASŁA!
                support.setRole("HELPDESK");
                support.setFirstName("Piotr");
                support.setLastName("Nowak");
                userRepository.save(support);

                System.out.println("✅ Pomyślnie utworzono użytkowników z zakodowanymi hasłami!");
            }
        };
    }
}