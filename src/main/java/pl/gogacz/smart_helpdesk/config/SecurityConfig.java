package pl.gogacz.smart_helpdesk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Publiczne endpointy
                        .requestMatchers("/api/auth/**").permitAll()

                        // TYMCZASOWE: Odblokowanie przycisku naprawczego (jeśli go dodałeś)
                        .requestMatchers("/api/auth/fix-admin-role").permitAll()

                        // 2. Kategorie
                        // GET dostępny dla każdego zalogowanego (hasAnyAuthority zamiast hasRole)
                        .requestMatchers(HttpMethod.GET, "/api/categories").authenticated()
                        // Zarządzanie kategoriami TYLKO dla ADMINA
                        .requestMatchers("/api/categories/**").hasAuthority("ADMIN")

                        // 3. Użytkownicy
                        // Tutaj był błąd - zmieniamy hasAnyRole na hasAnyAuthority
                        // Dzięki temu zadziała zarówno "ADMIN", "USER" jak i "HELPDESK"
                        .requestMatchers("/api/users/**").hasAnyAuthority("ADMIN", "USER", "HELPDESK")

                        // 4. Panel Admina
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // Reszta wymaga logowania
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Upewnij się, że port Angulara jest poprawny (zazwyczaj 4200)
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}