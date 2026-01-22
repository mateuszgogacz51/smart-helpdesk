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
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {

                // ADMIN
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setRole("ADMIN");
                admin.setFirstName("Admin");
                admin.setLastName("Systemowy");
                admin.setEmail("admin@helpdesk.pl");
                admin.setDepartment("IT");
                admin.setDefaultPriority("NORMAL");
                userRepository.save(admin);

                // USER (Zwykły)
                User user = new User();
                user.setUsername("user");
                user.setPassword(passwordEncoder.encode("user"));
                user.setRole("USER");
                user.setFirstName("Jan");
                user.setLastName("Kowalski");
                user.setEmail("jan@firma.pl");
                user.setDepartment("Sprzedaż");
                user.setDefaultPriority("NORMAL");
                userRepository.save(user);

                // HELPDESK
                User support = new User();
                support.setUsername("support");
                support.setPassword(passwordEncoder.encode("support"));
                support.setRole("HELPDESK");
                support.setFirstName("Piotr");
                support.setLastName("Nowak");
                support.setEmail("support@helpdesk.pl");
                support.setDepartment("IT Support");
                support.setDefaultPriority("NORMAL");
                userRepository.save(support);

                // VIP (Prezes) - tutaj była przyczyna błędu
                User vip = new User();
                vip.setUsername("prezes");
                vip.setPassword(passwordEncoder.encode("prezes"));
                vip.setRole("USER");
                vip.setFirstName("Prezes");
                vip.setLastName("Ważny");
                vip.setEmail("ceo@firma.pl");
                vip.setDepartment("Zarząd");
                vip.setDefaultPriority("HIGH"); // <--- NAPRAWA: Ustawiamy Priorytet zamiast Typu Konta
                userRepository.save(vip);

                System.out.println("✅ Pomyślnie utworzono użytkowników (w tym VIP z priorytetem HIGH)!");
            }
        };
    }
}