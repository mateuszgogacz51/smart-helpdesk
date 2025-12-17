package pl.gogacz.smart_helpdesk.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Pozwól na dostęp do wszystkich adresów (np. /api/tickets)
                .allowedOrigins("http://localhost:4200") // Tylko aplikacja z tego portu może wejść (tu będzie Angular)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Pozwól na te metody
                .allowedHeaders("*") // Pozwól na wszystkie nagłówki
                .allowCredentials(true); // Pozwól na przesyłanie ciasteczek/logowania
    }
}
