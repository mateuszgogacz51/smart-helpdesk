package pl.gogacz.smart_helpdesk.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestEmailController {

    @Autowired
    private JavaMailSender emailSender;

    // Wywołaj w przeglądarce: http://localhost:8080/test-email?to=TWOJ_MAIL@interia.pl
    @GetMapping("/test-email")
    public String sendTestEmail(@RequestParam String to) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("mako51@interia.pl"); // <-- WPISZ TU SWÓJ ADRES INTERII (ten z application.properties)
            message.setTo(to);
            message.setSubject("Test Smart Helpdesk");
            message.setText("Jeśli to czytasz, konfiguracja działa!");

            emailSender.send(message);
            return "SUKCES! E-mail został wysłany do: " + to;
        } catch (Exception e) {
            e.printStackTrace(); // Wypisze pełny błąd w konsoli
            return "BŁĄD: " + e.getMessage() + " (Sprawdź konsolę po więcej szczegółów)";
        }
    }
}