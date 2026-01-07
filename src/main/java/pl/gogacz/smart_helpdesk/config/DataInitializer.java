package pl.gogacz.smart_helpdesk.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           TicketRepository ticketRepository,
                           @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔄 Sprawdzanie spójności danych...");

        // 1. UPEWNIAMY SIĘ, ŻE UŻYTKOWNICY ISTNIEJĄ
        if (userRepository.count() == 0) {
            System.out.println("🚀 Baza pusta. Tworzenie użytkowników...");
            createUser("admin", "admin123", "ADMIN", "Administrator", "admin@helpdesk.pl", "Zarząd");
            createUser("marek", "marek123", "HELPDESK", "Marek", "marek@helpdesk.pl", "IT");
            createUser("jan", "jan123", "USER", "Jan", "jan@firma.pl", "Księgowość");
        } else {
            System.out.println("✅ Użytkownicy już istnieją.");
        }

        // 2. A TERAZ KLUCZOWY MOMENT - SPRAWDZAMY CZY SĄ ZGŁOSZENIA
        // (Niezależnie od tego, czy użytkownicy byli wcześniej!)
        if (ticketRepository.count() == 0) {
            System.out.println("⚠️ Brak zgłoszeń! Dodaję dane testowe...");

            // Pobieramy użytkownika 'jan', żeby przypisać mu zgłoszenia
            User author = userRepository.findByUsername("jan").orElse(null);
            User helpdesk = userRepository.findByUsername("marek").orElse(null);

            if (author != null) {
                createTicket("Drukarka nie działa", "Wciąga papier.", "SPRZET", "OPEN", "Biuro 202", author, null);
                createTicket("Brak VPN", "Nie łączy z siecią.", "SIEC", "IN_PROGRESS", "Dom", author, helpdesk);
                createTicket("Monitor miga", "Bolą oczy.", "SPRZET", "OPEN", "Biuro 101", author, null);
                System.out.println("✅ ZGŁOSZENIA ZOSTAŁY DODANE!");
            }
        } else {
            System.out.println("✅ Zgłoszenia już istnieją w bazie.");
        }
    }

    // Metody pomocnicze, żeby kod był czystszy
    private void createUser(String username, String pass, String role, String name, String email, String department) {
        User u = new User();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(pass));
        u.setRole(role);
        u.setFirstName(name);
        u.setEmail(email);
        u.setDepartment(department);
        userRepository.save(u);
    }

    private void createTicket(String title, String desc, String cat, String status, String loc, User author, User assigned) {
        Ticket t = new Ticket();
        t.setTitle(title);
        t.setDescription(desc);
        t.setCategory(cat);
        t.setStatus(status);
        t.setLocation(loc);
        t.setCreatedDate(LocalDateTime.now());
        t.setAuthor(author);
        t.setAssignedUser(assigned);
        ticketRepository.save(t);
    }
}