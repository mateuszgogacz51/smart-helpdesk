package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gogacz.smart_helpdesk.model.Notification;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Pobierz wszystkie powiadomienia dla danego użytkownika (od najnowszych)
    List<Notification> findByRecipientIdOrderByCreatedDateDesc(Long recipientId);

    // Policz ile jest nieprzeczytanych (do czerwonej kropki na dzwonku)
    long countByRecipientIdAndIsReadFalse(Long recipientId);
}