package pl.gogacz.smart_helpdesk.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import pl.gogacz.smart_helpdesk.model.Category;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.model.enums.TicketPriority;
import pl.gogacz.smart_helpdesk.model.enums.TicketStatus;
import pl.gogacz.smart_helpdesk.repository.CategoryRepository;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(UserRepository userRepository,
                           TicketRepository ticketRepository,
                           CategoryRepository categoryRepository,
                           PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. UŻYTKOWNICY (Sprawdzamy niezależnie)
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                admin.setFirstName("Główny");
                admin.setLastName("Administrator");
                admin.setEmail("admin@firma.pl");
                admin.setDefaultPriority("HIGH");
                userRepository.save(admin);

                User user = new User();
                user.setUsername("user");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setRole("USER");
                user.setFirstName("Jan");
                user.setLastName("Kowalski");
                user.setEmail("jan@firma.pl");
                user.setDepartment("IT");
                user.setPhoneNumber("123-456-789");
                userRepository.save(user);

                User helpdesk = new User();
                helpdesk.setUsername("serwis");
                helpdesk.setPassword(passwordEncoder.encode("serwis123"));
                helpdesk.setRole("HELPDESK");
                helpdesk.setFirstName("Adam");
                helpdesk.setLastName("Serwisant");
                userRepository.save(helpdesk);

                System.out.println("--- Dodano użytkowników ---");
            }

            // 2. KATEGORIE (To musi się wykonać, nawet jak userzy już są!)
            if (categoryRepository.count() == 0) {
                Category c1 = categoryRepository.save(new Category("Sprzęt"));
                Category c2 = categoryRepository.save(new Category("Sieć"));
                Category c3 = categoryRepository.save(new Category("Inne"));

                System.out.println("--- Dodano kategorie ---");
            }
        };
    }
}