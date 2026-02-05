package pl.gogacz.smart_helpdesk.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.model.enums.TicketPriority; // <--- IMPORT
import pl.gogacz.smart_helpdesk.model.enums.TicketStatus;   // <--- IMPORT
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(UserRepository userRepository,
                           TicketRepository ticketRepository,
                           PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Użytkownicy (bez zmian - kopiuję Twój obecny kod)
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                admin.setFirstName("Główny");
                admin.setLastName("Administrator");
                admin.setEmail("admin@firma.pl");
                userRepository.save(admin);

                User user = new User();
                user.setUsername("user");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setRole("USER");
                user.setFirstName("Jan");
                user.setLastName("Kowalski");
                user.setEmail("jan@firma.pl");
                userRepository.save(user);

                User helpdesk = new User();
                helpdesk.setUsername("serwis");
                helpdesk.setPassword(passwordEncoder.encode("serwis123"));
                helpdesk.setRole("HELPDESK");
                helpdesk.setFirstName("Adam");
                helpdesk.setLastName("Serwisant");
                userRepository.save(helpdesk);

                // 2. Przykładowe Zgłoszenia (POPRAWIONE NA ENUMY)
                Ticket t1 = new Ticket();
                t1.setTitle("Nie działa drukarka");
                t1.setDescription("Drukarka na 2 piętrze wciąga papier.");
                t1.setStatus(TicketStatus.OPEN);       // <--- Było "OPEN"
                t1.setPriority(TicketPriority.HIGH);   // <--- Było "HIGH"
                t1.setCategory("Sprzęt");
                t1.setCreatedDate(LocalDateTime.now());
                t1.setAuthor(user);
                ticketRepository.save(t1);

                Ticket t2 = new Ticket();
                t2.setTitle("Brak dostępu do VPN");
                t2.setDescription("Nie mogę się połączyć z domu.");
                t2.setStatus(TicketStatus.IN_PROGRESS); // <--- Było "IN_PROGRESS"
                t2.setPriority(TicketPriority.NORMAL);  // <--- Było "NORMAL"
                t2.setCategory("Sieć");
                t2.setCreatedDate(LocalDateTime.now().minusHours(2));
                t2.setAuthor(user);
                t2.setAssignedUser(helpdesk);
                ticketRepository.save(t2);

                System.out.println("--- ZAINICJOWANO DANE TESTOWE ---");
            }
        };
    }
}