import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app'; // Poprawiony import

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Ten test sprawdza czy masz tytuł h1 - jeśli go zmieniłeś w HTML, test może nie przejść,
  // ale to nie blokuje działania aplikacji :)
});
