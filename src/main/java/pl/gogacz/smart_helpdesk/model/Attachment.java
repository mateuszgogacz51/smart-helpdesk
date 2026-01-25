package pl.gogacz.smart_helpdesk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;
    private String fileType;

    @Lob // Informuje bazę, że to duży obiekt binarny (BLOB)
    private byte[] data;

    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    // Konstruktory
    public Attachment() {}

    public Attachment(String filename, String fileType, byte[] data, Ticket ticket) {
        this.filename = filename;
        this.fileType = fileType;
        this.data = data;
        this.ticket = ticket;
        this.createdDate = LocalDateTime.now();
    }

    // Gettery i Settery
    public Long getId() { return id; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public byte[] getData() { return data; }
    public void setData(byte[] data) { this.data = data; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }
}