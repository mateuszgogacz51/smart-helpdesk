package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets") // <--- TO JEST KLUCZOWE! (Żeby Java widziała tabelę z SQL-a)
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tytuł zgłoszenia nie może być pusty")
    private String title;

    @Column(length = 4096)
    private String description;

    @NotBlank(message = "Podaj lokalizację")
    private String location;

    private String category;

    // Status domyślny
    private String status = "OPEN";

    @Column(updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    // --- RELACJE ---

    // Autor zgłoszenia (Tego brakowało!)
    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    // Przypisany pracownik
    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser;

    // --- GETTERY I SETTERY ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public User getAssignedUser() { return assignedUser; }
    public void setAssignedUser(User assignedUser) { this.assignedUser = assignedUser; }
}