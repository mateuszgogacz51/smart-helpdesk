package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank; // <--- Import do walidacji
import java.time.LocalDateTime;

@Entity
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ZASADA: Tytuł jest obowiązkowy
    @NotBlank(message = "Tytuł zgłoszenia nie może być pusty")
    private String title;

    @Column(length = 2000)
    private String description;

    // NOWOŚĆ ZE ZDJĘCIA: Kategoria (np. Drukarka, Internet)
    // ZASADA: Musisz wybrać kategorię
    @NotBlank(message = "Kategoria jest wymagana (np. Awaria, Sprzęt)")
    private String category;

    // NOWOŚĆ ZE ZDJĘCIA: Lokalizacja (np. Pokój 102)
    @NotBlank(message = "Podaj lokalizację (np. numer pokoju)")
    private String location;

    private LocalDateTime createdDate;

    private String status = "NEW";

    // --- Gettery i Settery (Możesz wygenerować Alt+Insert, albo wkleić te) ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
    }
}