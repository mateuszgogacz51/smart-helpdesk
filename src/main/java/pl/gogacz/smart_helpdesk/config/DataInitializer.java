package pl.gogacz.smart_helpdesk.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Sprawdzamy, czy baza jest pusta
        if (userRepository.count() == 0) {
            System.out.println("🚀 Baza pusta. Dodaję przykładowych pracowników...");

            userRepository.save(new User("Jan", "Kowalski", "jan@firma.pl", "ADMIN"));
            userRepository.save(new User("Anna", "Nowak", "anna@firma.pl", "HELPDESK"));
            userRepository.save(new User("Marek", "Zegarek", "marek@firma.pl", "HELPDESK"));

            System.out.println("✅ Pracownicy dodani!");
        }
    }
}