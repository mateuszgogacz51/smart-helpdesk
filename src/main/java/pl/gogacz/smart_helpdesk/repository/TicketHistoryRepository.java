package pl.gogacz.smart_helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gogacz.smart_helpdesk.model.TicketHistory;
import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    // Chcemy historię posortowaną od najnowszej
    List<TicketHistory> findByTicketIdOrderByTimestampDesc(Long ticketId);
}