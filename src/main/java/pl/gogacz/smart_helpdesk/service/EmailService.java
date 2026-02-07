package pl.gogacz.smart_helpdesk.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendStatusChangeEmail(String to, Long ticketId, String newStatus) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("TWOJ_ADRES@interia.pl");
        message.setTo(to);
        message.setSubject("Zmiana statusu zgłoszenia #" + ticketId);
        message.setText("Dzień dobry,\n\nStatus Twojego zgłoszenia o numerze " + ticketId +
                " zmienił się na: " + newStatus + ".\n\nPozdrawiamy,\nZespół Smart Helpdesk");
        mailSender.send(message);
    }
}