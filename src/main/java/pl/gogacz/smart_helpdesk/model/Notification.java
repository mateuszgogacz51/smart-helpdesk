package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;       // Treść, np. "Nowy komentarz w zgłoszeniu #5"
    private Long ticketId;        // ID zgłoszenia, żeby po kliknięciu przenieść usera
    private boolean isRead = false; // Czy przeczytane (żeby zgasić czerwoną kropkę)
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "user_id") // Do kogo jest to powiadomienie
    private User recipient;
}