package pl.gogacz.smart_helpdesk;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import pl.gogacz.smart_helpdesk.model.Ticket;
import pl.gogacz.smart_helpdesk.repository.TicketRepository;

@SpringBootApplication
public class SmartHelpdeskApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartHelpdeskApplication.class, args);
	}

	@Bean
	CommandLineRunner runner(TicketRepository repository) {
		return args -> {
			Ticket ticket = new Ticket();
			ticket.setTitle("Awaria drukarki");
			ticket.setDescription("Dymi!");

			repository.save(ticket);

			System.out.println("----------------------------------------");
			System.out.println("🔥 SUKCES! Zapisano zgłoszenie w bazie!");
			System.out.println("----------------------------------------");
		};
	}
}