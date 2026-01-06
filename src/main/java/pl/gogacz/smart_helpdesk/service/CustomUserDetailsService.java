package pl.gogacz.smart_helpdesk.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Szukamy użytkownika w bazie po NAZWIE (username), a nie emailu
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Nie znaleziono użytkownika: " + username));

        // 2. Tłumaczymy go na obiekt zrozumiały dla Spring Security
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername()) // Używamy getUsername()
                .password(user.getPassword())
                .roles(user.getRole())
                .build();
    }
}