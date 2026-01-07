import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketDetailsComponent } from './ticket-details'; // Import bez .component jeśli tak nazwałeś plik
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TicketService } from '../ticket.service';

describe('TicketDetailsComponent', () => {
  let component: TicketDetailsComponent;
  let fixture: ComponentFixture<TicketDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TicketDetailsComponent, 
        HttpClientTestingModule, 
        RouterTestingModule
      ],
      providers: [TicketService]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TicketDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});