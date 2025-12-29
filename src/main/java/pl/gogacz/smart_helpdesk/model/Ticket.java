package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime; // <--- WAŻNY IMPORT

@Entity
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
    private String status;

    // --- NOWOŚĆ: Data utworzenia ---
    // Updatable = false oznacza, że data nie zmieni się przy edycji statusu!
    @Column(updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();
    // -------------------------------

    // --- Gettery i Settery ---
    // (Pamiętaj, żeby wygenerować lub dopisać getter i setter dla createdDate!)

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    // ... reszta getterów i setterów bez zmian ...
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
}