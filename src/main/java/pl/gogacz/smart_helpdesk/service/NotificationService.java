package pl.gogacz.smart_helpdesk.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.gogacz.smart_helpdesk.model.Notification;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Tworzenie powiadomienia
    public void createNotification(User recipient, String message, Long ticketId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setTicketId(ticketId);
        notification.setCreatedDate(LocalDateTime.now());
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    // Pobieranie listy dla użytkownika
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedDateDesc(userId);
    }

    // Licznik nieprzeczytanych
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
    // Oznaczanie jako przeczytane (gdy user kliknie w dzwonek/powiadomienie)
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}