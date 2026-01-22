package pl.gogacz.smart_helpdesk.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // TUTA BYŁ BŁĄD: Usunęliśmy metodę addCorsMappings.
    // Teraz całą konfiguracją CORS zarządza poprawnie SecurityConfig.java.
    // Ten plik musi pozostać pusty (poza definicją klasy).
}