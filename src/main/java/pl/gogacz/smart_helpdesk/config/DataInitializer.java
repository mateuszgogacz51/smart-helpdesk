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
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Jeśli baza pusta, dodaj użytkowników
            if (userRepository.count() == 0) {

                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setRole("ADMIN");
                admin.setFirstName("Administrator");
                admin.setLastName("Systemu");
                admin.setDefaultPriority("HIGH");
                userRepository.save(admin);

                User marek = new User();
                marek.setUsername("marek");
                marek.setPassword(passwordEncoder.encode("marek"));
                marek.setRole("HELPDESK");
                marek.setFirstName("Marek");
                marek.setLastName("Serwisant");
                marek.setDefaultPriority("NORMAL");
                userRepository.save(marek);

                User prezes = new User();
                prezes.setUsername("prezes");
                prezes.setPassword(passwordEncoder.encode("prezes"));
                prezes.setRole("BOARD");
                prezes.setFirstName("Pan");
                prezes.setLastName("Prezes");
                prezes.setDefaultPriority("HIGH");
                userRepository.save(prezes);

                User jan = new User();
                jan.setUsername("jan");
                jan.setPassword(passwordEncoder.encode("jan"));
                jan.setRole("USER");
                jan.setFirstName("Jan");
                jan.setLastName("Kowalski");
                jan.setDefaultPriority("LOW");
                userRepository.save(jan);

                System.out.println("✅ Baza danych zainicjowana poprawnie!");
            }
        };
    }
}