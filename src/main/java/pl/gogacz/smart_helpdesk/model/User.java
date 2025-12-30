package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users") // 'User' to słowo kluczowe w SQL, więc bezpieczniej nazwać tabelę 'app_users'
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String role; // np. "ADMIN", "HELPDESK"

    // Pusty konstruktor (wymagany przez JPA)
    public User() {}

    // Konstruktor dla naszej wygody
    public User(String firstName, String lastName, String email, String role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
    }

    // Gettery i Settery
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}