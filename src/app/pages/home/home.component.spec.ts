import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([{ path: 'kontakt', children: [] }]),
        {
          provide: ContactService,
          useValue: { sendContact: () => of({ ok: true }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  it('hat jeden Abschnitt, den die Navigation anspringt', () => {
    for (const id of ['leistungen', 'prozess', 'ueber-mich', 'kontakt']) {
      expect(query(`#${id}`)).withContext(id).not.toBeNull();
    }
  });

  it('zeigt das Portraet mit Alternativtext im Ueber-Abschnitt', () => {
    const img = query('#ueber-mich img') as HTMLImageElement;

    expect(img.getAttribute('src')).toBe('assets/sonja-waldenspuhl.jpg');
    expect(img.alt).toContain('Sonja Waldenspuhl');
  });

  it('zeigt zum angetippten Problem die Loesung und reicht es an die Anfrage weiter', () => {
    expect(query('.pain-solution')).toBeNull();

    (query('.pain') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(query('.pain-solution')!.textContent).toContain('moderne Website');
    expect(query('.pain')!.getAttribute('aria-pressed')).toBe('true');
    expect(query('.opt.on')!.textContent).toContain('Website modernisieren');
    expect(query('.chips-mini')).toBeNull();
  });

  it('markiert zu mehreren Problemen alle passenden Themen und jedes nur einmal', () => {
    component.togglePain('excel');
    component.togglePain('phone');
    component.togglePain('copy');
    fixture.detectChanges();

    const selected = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.opt.on'));
    expect(selected.map((option) => option.querySelector('b')!.textContent)).toEqual([
      'Webanwendung',
      'Automatisierung',
    ]);
  });

  it('nimmt ein Problem beim zweiten Antippen wieder heraus', () => {
    component.togglePain('web');
    component.togglePain('web');
    fixture.detectChanges();

    expect(component.painLabels()).toEqual([]);
    expect(query('.pain-bar .btn')).toBeNull();
  });

  it('oeffnet im FAQ immer nur eine Antwort', () => {
    expect(fixture.nativeElement.querySelectorAll('.qa p').length).toBe(1);

    component.toggleFaq(2);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.qa p').length).toBe(1);
    expect(query('#faq-q-2')!.getAttribute('aria-expanded')).toBe('true');
    expect(query('#faq-q-0')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('uebernimmt die Kennenlernaktion in die Anfrage', fakeAsync(() => {
    (query('.offer button') as HTMLButtonElement).click();
    tick();
    fixture.detectChanges();

    expect(query('app-inquiry-form')!.textContent).toContain('Kennenlernaktion');
    expect(query('.opt.on')!.textContent).toContain('Neue Website');
  }));
});
