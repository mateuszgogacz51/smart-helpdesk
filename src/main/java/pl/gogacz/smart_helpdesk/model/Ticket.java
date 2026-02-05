package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;
import lombok.Data;
import pl.gogacz.smart_helpdesk.model.enums.TicketPriority; // <--- NOWY IMPORT
import pl.gogacz.smart_helpdesk.model.enums.TicketStatus;   // <--- NOWY IMPORT

import java.time.LocalDateTime;

@Entity
@Data
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String description;

    // --- ZMIANA: String -> Enum ---
    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    private TicketPriority priority;
    // ------------------------------

    private String category;

    private String location;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User author;

    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser;

    private LocalDateTime createdDate;
    private LocalDateTime lastUpdated;
}