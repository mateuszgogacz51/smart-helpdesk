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
                        // --- 1. PLIKI STATYCZNE ANGULARA (PUBLICZNE) ---
                        // Te reguły pozwalają serwerowi wysłać frontend do przeglądarki
                        .requestMatchers("/", "/index.html", "/favicon.ico", "/*.js", "/*.css", "/assets/**").permitAll()

                        // --- 2. PUBLICZNE API ---
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/auth/fix-admin-role").permitAll()

                        // --- 3. KATEGORIE ---
                        .requestMatchers(HttpMethod.GET, "/api/categories").authenticated()
                        .requestMatchers("/api/categories/**").hasAuthority("ADMIN")

                        // --- 4. UŻYTKOWNICY I ADMIN ---
                        .requestMatchers("/api/users/**").hasAnyAuthority("ADMIN", "USER", "HELPDESK")
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // --- 5. RESZTA (WYMAGA LOGOWANIA) ---
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
        // Pozwalamy na localhost:4200 (dev) oraz puste origin (produkcja z JARa)
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}