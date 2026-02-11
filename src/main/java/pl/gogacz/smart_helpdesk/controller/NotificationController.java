package pl.gogacz.smart_helpdesk.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.gogacz.smart_helpdesk.model.Notification;
import pl.gogacz.smart_helpdesk.model.User;
import pl.gogacz.smart_helpdesk.repository.UserRepository;
import pl.gogacz.smart_helpdesk.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Notification> getNotifications(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return notificationService.getUserNotifications(user.getId());
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return notificationService.getUnreadCount(user.getId());
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    // W pliku src/main/java/pl/gogacz/smart_helpdesk/controller/NotificationController.java

// ... istniejące metody ...

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }
}