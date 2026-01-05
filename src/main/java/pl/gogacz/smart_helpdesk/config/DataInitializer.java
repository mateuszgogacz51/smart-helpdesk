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
        if (userRepository.count() == 0) {
            System.out.println("🚀 Baza pusta. Dodaję pracowników z hasłami...");

            // Hasło dla wszystkich to: haslo123
            // {noop} oznacza "no operation" - czyli brak szyfrowania (tylko do testów!)
            userRepository.save(new User("Jan", "Kowalski", "jan@firma.pl", "{noop}haslo123", "ADMIN"));
            userRepository.save(new User("Anna", "Nowak", "anna@firma.pl", "{noop}haslo123", "HELPDESK"));
            userRepository.save(new User("Marek", "Zegarek", "marek@firma.pl", "{noop}haslo123", "HELPDESK"));

            System.out.println("✅ Pracownicy dodani!");
        }
    }
}