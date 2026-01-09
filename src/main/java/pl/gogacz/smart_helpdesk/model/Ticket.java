package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000) // Zwiększony limit znaków dla opisu
    private String description;

    private String category;
    private String location;
    private String status; // Np. OPEN, IN_PROGRESS, CLOSED

    private LocalDateTime createdDate;

    // --- NOWE POLE DO SORTOWANIA ---
    private LocalDateTime lastUpdated;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User author;

    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser;

    // --- KONSTRUKTORY ---

    public Ticket() {
    }

    public Ticket(String title, String description, String category, String location, User author) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.location = location;
        this.author = author;
        this.status = "OPEN";
        this.createdDate = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    // --- GETTERY I SETTERY ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    // Specjalny getter dla lastUpdated
    // Jeśli lastUpdated jest null (stare zgłoszenia), zwracamy datę utworzenia
    public LocalDateTime getLastUpdated() {
        return lastUpdated != null ? lastUpdated : createdDate;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public User getAssignedUser() {
        return assignedUser;
    }

    public void setAssignedUser(User assignedUser) {
        this.assignedUser = assignedUser;
    }
}