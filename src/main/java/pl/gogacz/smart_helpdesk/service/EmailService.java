package pl.gogacz.smart_helpdesk.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;

    // Pobieramy Twój adres z application.properties (mako51@interia.pl)
    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    // --- 1. Powiadomienie o zmianie statusu ---
    @Async
    public void sendStatusChangeEmail(String to, Long ticketId, String newStatus) {
        sendEmail(to, "Aktualizacja zgłoszenia #" + ticketId,
                "Status Twojego zgłoszenia #" + ticketId + " został zmieniony na: " + newStatus);
    }

    // --- 2. NOWOŚĆ: Powiadomienie o nowym komentarzu ---
    @Async
    public void sendNewCommentEmail(String to, Long ticketId, String authorName, String commentContent) {
        String subject = "Nowy komentarz do zgłoszenia #" + ticketId;
        String body = "Witaj,\n\n" +
                "Użytkownik " + authorName + " dodał nowy komentarz do zgłoszenia #" + ticketId + ":\n\n" +
                "\"" + commentContent + "\"\n\n" +
                "Zaloguj się do systemu, aby odpowiedzieć.\n" +
                "Pozdrawiamy,\nZespół Smart Helpdesk";

        sendEmail(to, subject, body);
    }

    // --- Metoda pomocnicza (żeby nie powielać kodu) ---
    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // WAŻNE: To naprawia błąd 553 - nadawca musi być zgodny z loginem!
            message.setFrom(senderEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            javaMailSender.send(message);
            System.out.println("--> E-MAIL WYSŁANY do: " + to);
        } catch (Exception e) {
            System.err.println("!!! BŁĄD WYSYŁANIA MAILA: " + e.getMessage());
            e.printStackTrace();
        }
    }
}