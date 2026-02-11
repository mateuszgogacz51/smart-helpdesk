package pl.gogacz.smart_helpdesk.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.gogacz.smart_helpdesk.model.Comment;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.CommentRepository;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;
import pl.gogacz.smart_helpdesk.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService; // <--- NOWE POLE

    // Wstrzykujemy NotificationService w konstruktorze
    public CommentService(CommentRepository commentRepository,
                          TicketRepository ticketRepository,
                          UserRepository userRepository,
                          EmailService emailService,
                          NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    public List<Comment> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedDateAsc(ticketId);
    }

    @Transactional
    public Comment addComment(Long ticketId, String content, String username) {
        // 1. Walidacja
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Treść komentarza nie może być pusta");
        }

        // 2. Pobieranie danych
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zgłoszenia o ID: " + ticketId));

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika: " + username));

        // 3. Tworzenie obiektu komentarza
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setCreatedDate(LocalDateTime.now());
        comment.setAuthor(author);
        comment.setTicket(ticket);

        // 4. Aktualizacja zgłoszenia (podbicie daty modyfikacji)
        ticket.setLastUpdated(LocalDateTime.now());
        ticketRepository.save(ticket);

        // 5. Zapis komentarza
        Comment savedComment = commentRepository.save(comment);

        // 6. Powiadomienia (Mail + Dzwoneczek)
        // Używamy try-catch, żeby błąd wysyłki nie cofnął zapisu komentarza
        try {
            sendNotification(ticket, author, content);
        } catch (Exception e) {
            System.err.println("!!! BŁĄD POWIADOMIEŃ: " + e.getMessage());
            e.printStackTrace();
        }

        return savedComment;
    }

    // --- METODA DIAGNOSTYCZNA DO WYSYŁANIA POWIADOMIEŃ ---
    private void sendNotification(Ticket ticket, User commentAuthor, String content) {
        User ticketOwner = ticket.getAuthor();      // Autor zgłoszenia
        User assignee = ticket.getAssignedUser();   // Przypisany serwisant

        System.out.println("\n========== [SYSTEM POWIADOMIEŃ] ==========");
        System.out.println("Zgłoszenie ID: " + ticket.getId());
        System.out.println("Komentujący: " + commentAuthor.getUsername());

        // --- 1. SPRAWDZANIE WŁAŚCICIELA ZGŁOSZENIA ---
        if (ticketOwner != null) {
            // Warunek: Czy komentujący to inna osoba niż właściciel?
            if (!commentAuthor.getId().equals(ticketOwner.getId())) {

                // A. Wyślij Maila
                if (ticketOwner.getEmail() != null && !ticketOwner.getEmail().isEmpty()) {
                    System.out.println("   >>> MAIL do Właściciela: " + ticketOwner.getEmail());
                    emailService.sendNewCommentEmail(ticketOwner.getEmail(), ticket.getId(), commentAuthor.getUsername(), content);
                }

                // B. Stwórz Powiadomienie (Dzwoneczek)
                System.out.println("   >>> DZWONEK dla Właściciela: " + ticketOwner.getUsername());
                notificationService.createNotification(
                        ticketOwner,
                        "Nowy komentarz od " + commentAuthor.getUsername() + " w zgłoszeniu #" + ticket.getId(),
                        ticket.getId()
                );

            } else {
                System.out.println("   --- POMIJAM Właściciela (to ta sama osoba co komentujący).");
            }
        }

        // --- 2. SPRAWDZANIE PRZYPISANEGO SERWISANTA ---
        if (assignee != null) {
            // Warunek: Czy komentujący to inna osoba niż serwisant?
            if (!commentAuthor.getId().equals(assignee.getId())) {

                // A. Wyślij Maila
                if (assignee.getEmail() != null && !assignee.getEmail().isEmpty()) {
                    System.out.println("   >>> MAIL do Serwisanta: " + assignee.getEmail());
                    emailService.sendNewCommentEmail(assignee.getEmail(), ticket.getId(), commentAuthor.getUsername(), content);
                }

                // B. Stwórz Powiadomienie (Dzwoneczek)
                System.out.println("   >>> DZWONEK dla Serwisanta: " + assignee.getUsername());
                notificationService.createNotification(
                        assignee,
                        "Nowy komentarz od " + commentAuthor.getUsername() + " w zgłoszeniu #" + ticket.getId(),
                        ticket.getId()
                );

            } else {
                System.out.println("   --- POMIJAM Serwisanta (to ta sama osoba co komentujący).");
            }
        }
        System.out.println("=============================================\n");
    }
}