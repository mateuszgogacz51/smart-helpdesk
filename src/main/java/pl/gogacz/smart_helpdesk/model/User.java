package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String password; // <--- NOWE POLE
    private String role;

    public User() {}

    // Zaktualizowany konstruktor (ma teraz hasło)
    public User(String firstName, String lastName, String email, String password, String role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
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

    // <--- NOWE GETTERY I SETTERY
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    // ---------------------------

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}