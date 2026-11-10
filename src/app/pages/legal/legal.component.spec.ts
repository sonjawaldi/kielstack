import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { LegalComponent } from './legal.component';

describe('LegalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(LegalComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('hat einen Abschnitt fuer jeden Pfad, den der Footer verlinkt', () => {
    const page = render();

    for (const id of ['impressum', 'datenschutz', 'barrierefreiheit']) {
      expect(page.querySelector(`#${id}`))
        .withContext(id)
        .not.toBeNull();
    }
  });

  it('nennt im Impressum die Angaben nach § 5 DDG mit eigener Anschrift', () => {
    const imprint = render().querySelector('#impressum')!.textContent!;

    expect(imprint).toContain('§ 5 DDG');
    expect(imprint).toContain('Sonja Waldenspuhl');
    expect(imprint).toContain('24113 Kiel');
    expect(imprint).toContain('business@kielstack.de');
    expect(imprint).not.toContain('TMG');
  });

  it('verweist nicht mehr auf die Texte von sonjawaldenspuhl.de', () => {
    const links = Array.from(render().querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(links.filter((href) => href?.startsWith('https://sonjawaldenspuhl.de'))).toEqual([]);
  });

  it('setzt den Seitentitel und stellt ihn beim Verlassen wieder her', () => {
    const title = TestBed.inject(Title);
    title.setTitle('Kielstack');

    const fixture = TestBed.createComponent(LegalComponent);
    fixture.detectChanges();
    expect(title.getTitle()).toBe('Rechtliches | Kielstack');

    fixture.destroy();
    expect(title.getTitle()).toBe('Kielstack');
  });
});
