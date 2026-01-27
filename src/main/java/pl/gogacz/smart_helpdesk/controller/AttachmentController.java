package pl.gogacz.smart_helpdesk.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pl.gogacz.smart_helpdesk.model.Attachment;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.repository.AttachmentRepository;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;

    public AttachmentController(AttachmentRepository attachmentRepository, TicketRepository ticketRepository) {
        this.attachmentRepository = attachmentRepository;
        this.ticketRepository = ticketRepository;
    }

    // 1. Pobieranie listy plików dla zgłoszenia (tylko nazwy, bez danych binarnych)
    @GetMapping("/ticket/{ticketId}")
    public List<Map<String, Object>> getAttachmentsByTicket(@PathVariable Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId).stream()
                // FIX: Wymuszenie typów <String, Object>, aby Java nie zgłaszała błędu
                .map(att -> Map.<String, Object>of(
                        "id", att.getId(),
                        "filename", att.getFilename(),
                        "fileType", att.getFileType(),
                        "createdDate", att.getCreatedDate()
                ))
                .toList();
    }

    // 2. Pobieranie konkretnego pliku (download)
    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getAttachment(@PathVariable Long id) {
        Attachment attachment = attachmentRepository.findById(id).orElseThrow();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(attachment.getFileType()))
                .body(attachment.getData());
    }

    // 3. Wysyłanie pliku
    @PostMapping("/upload")
    public ResponseEntity<?> uploadAttachment(@RequestParam("ticketId") Long ticketId,
                                              @RequestParam("file") MultipartFile file) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Nie znaleziono zgłoszenia"));

            Attachment attachment = new Attachment(
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes(),
                    ticket
            );

            attachmentRepository.save(attachment);
            return ResponseEntity.ok(Map.of("message", "Plik dodany pomyślnie"));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Błąd podczas wysyłania pliku");
        }
    }
}