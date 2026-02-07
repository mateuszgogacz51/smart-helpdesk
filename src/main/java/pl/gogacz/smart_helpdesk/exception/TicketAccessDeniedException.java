package pl.gogacz.smart_helpdesk.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.FORBIDDEN) // Zwróci kod 403 Forbidden
public class TicketAccessDeniedException extends RuntimeException {
    public TicketAccessDeniedException(String message) {
        super(message);
    }
}