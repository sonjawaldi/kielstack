import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { LegalComponent, PRIVACYBEE_WIDGETS } from './legal.component';

describe('LegalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function scripts(src: string): HTMLScriptElement[] {
    return Array.from(document.querySelectorAll<HTMLScriptElement>(`script[src="${src}"]`));
  }

  afterEach(() => {
    for (const { src } of PRIVACYBEE_WIDGETS) scripts(src).forEach((script) => script.remove());
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

  it('bindet das Impressum ueber das PrivacyBee-Widget ein', () => {
    const widget = render().querySelector('#impressum imprint-widget')!;

    expect(widget).not.toBeNull();
    expect(widget.getAttribute('website-id')).toBe('cmwayyilz00a22zq998xmrt48');
    expect(widget.getAttribute('lang')).toBe('de');
  });

  it('zeigt das eigene Impressum nach § 5 DDG, wenn PrivacyBee nicht erreichbar ist', () => {
    const fixture = TestBed.createComponent(LegalComponent);
    fixture.detectChanges();
    const imprint = () => fixture.nativeElement.querySelector('#impressum').textContent as string;

    expect(imprint()).not.toContain('§ 5 DDG');

    const [imprintScript] = scripts(PRIVACYBEE_WIDGETS[0].src);
    imprintScript.onerror!(new Event('error'));
    fixture.detectChanges();

    expect(imprint()).toContain('§ 5 DDG');
    expect(imprint()).toContain('Sonja Waldenspuhl');
    expect(imprint()).toContain('24113 Kiel');
    expect(imprint()).toContain('business@kielstack.de');
  });

  it('zeigt einen Hinweis, wenn die Datenschutzerklaerung nicht geladen werden kann', () => {
    const fixture = TestBed.createComponent(LegalComponent);
    fixture.detectChanges();

    scripts(PRIVACYBEE_WIDGETS[1].src)[0].onerror!(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#datenschutz').textContent).toContain(
      'kann gerade nicht geladen werden',
    );
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

  it('bindet die Datenschutzerklaerung ueber das PrivacyBee-Widget ein', () => {
    const widget = render().querySelector('#datenschutz privacybee-widget')!;

    expect(widget).not.toBeNull();
    expect(widget.getAttribute('website-id')).toBe('cmwayyilz00a22zq998xmrt48');
    expect(widget.getAttribute('type')).toBe('dsgvo');
    expect(widget.getAttribute('lang')).toBe('de');
  });

  it('laedt jedes PrivacyBee-Skript genau einmal, auch beim zweiten Besuch', () => {
    render();
    render();

    for (const { src } of PRIVACYBEE_WIDGETS) {
      expect(scripts(src).length).withContext(src).toBe(1);
    }
  });
});
