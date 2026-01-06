package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000) // Dłuższy tekst
    private String content;

    private LocalDateTime createdDate = LocalDateTime.now();

    // RELACJA 1: Kto napisał komentarz?
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    // RELACJA 2: Do jakiego zgłoszenia należy ten komentarz?
    // JsonBackReference zapobiega pętli przy generowaniu JSON-a (Ticket -> Comment -> Ticket...)
    // Musisz dodać import: com.fasterxml.jackson.annotation.JsonBackReference;
    // Jeśli go nie masz, możemy to na razie pominąć, ale przy API będzie potrzebne.
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
}