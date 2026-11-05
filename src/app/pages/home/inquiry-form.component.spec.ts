import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { InquiryFormComponent } from './inquiry-form.component';

describe('InquiryFormComponent', () => {
  let fixture: ComponentFixture<InquiryFormComponent>;
  let component: InquiryFormComponent;
  let sendContact: jasmine.Spy;

  beforeEach(async () => {
    sendContact = jasmine.createSpy('sendContact').and.returnValue(of({ ok: true }));

    await TestBed.configureTestingModule({
      imports: [InquiryFormComponent],
      providers: [{ provide: ContactService, useValue: { sendContact } }],
    }).compileComponents();

    fixture = TestBed.createComponent(InquiryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  /** Formular mit den Fehlern, die NgForm fuer die Pflichtfelder melden wuerde. */
  function formWith(errors: Record<string, Record<string, true> | null> = {}): NgForm {
    const controls = Object.fromEntries(
      Object.entries(errors).map(([field, fieldErrors]) => [field, { errors: fieldErrors }]),
    );
    return { controls, control: { markAllAsTouched() {} } } as unknown as NgForm;
  }

  it('bleibt ohne Thema auf Schritt 1 und sagt, was fehlt', () => {
    component.next();
    fixture.detectChanges();

    expect(component.step()).toBe(1);
    expect(query('.err')!.textContent).toContain('Thema');
  });

  it('zeigt in Schritt 2 nur die Fragen zum gewaehlten Thema', () => {
    component.toggleTopic('auto');
    component.next();
    fixture.detectChanges();

    expect(query('#tools-label')).not.toBeNull();
    expect(query('#pages-label')).toBeNull();
    expect(query('#features-label')).toBeNull();
  });

  it('fragt bei mehreren Themen die Details zu allen ab und nennt alle in der Nachricht', () => {
    component.toggleTopic('auto');
    component.toggleTopic('redo');
    component.next();
    fixture.detectChanges();

    expect(query('#tools-label')).not.toBeNull();
    expect(query('#pages-label')).not.toBeNull();
    expect(query('#current-site')).not.toBeNull();

    component.submit(formWith());

    expect(sendContact.calls.mostRecent().args[0].message).toContain(
      'Thema: Website modernisieren, Automatisierung',
    );
  });

  it('waehlt die Themen der angetippten Punkte vor und nimmt sie mit ihnen wieder heraus', () => {
    fixture.componentRef.setInput('painTopics', ['redo', 'auto']);
    fixture.detectChanges();
    expect(component.selectedTopics()).toEqual(['redo', 'auto']);

    fixture.componentRef.setInput('painTopics', ['auto']);
    fixture.detectChanges();
    expect(component.selectedTopics()).toEqual(['auto']);
  });

  it('laesst von Hand gewaehlte Themen stehen, wenn sich die Punkte aendern', () => {
    component.toggleTopic('web');
    fixture.componentRef.setInput('painTopics', ['auto']);
    fixture.detectChanges();

    fixture.componentRef.setInput('painTopics', []);
    fixture.detectChanges();

    expect(component.selectedTopics()).toEqual(['web']);
  });

  it('geht zurueck zu Schritt 1, wenn unterwegs kein Thema mehr uebrig ist', () => {
    component.toggleTopic('web');
    component.step.set(3);
    component.toggleTopic('web');

    component.submit(formWith());
    fixture.detectChanges();

    expect(sendContact).not.toHaveBeenCalled();
    expect(component.step()).toBe(1);
    expect(query('.err')!.textContent).toContain('Thema');
  });

  it('sagt bis 5 Seiten, dass es zur Kennenlernaktion passt', () => {
    component.toggleTopic('web');
    component.pages.set('Mehr als 5');
    expect(component.offerFits()).toBeFalse();

    component.pages.set('4–5 Seiten');
    expect(component.offerFits()).toBeTrue();
  });

  it('schreibt die Auswahl in die Nachricht, damit sie beim Server ankommt', () => {
    fixture.componentRef.setInput('pains', ['Excel-Chaos']);
    component.toggleTopic('redo');
    component.pages.set('1–3 Seiten');
    component.currentSite = 'www.muster.de';
    component.time.set('Noch offen');
    component.name = 'Max Muster';
    component.email = 'max@muster.de';
    component.note = 'Bitte mit Rückruf.';

    component.submit(formWith());

    expect(sendContact).toHaveBeenCalledOnceWith({
      name: 'Max Muster',
      email: 'max@muster.de',
      website: '',
      message:
        'Thema: Website modernisieren\nSeiten: 1–3 Seiten\nAktuelle Website: www.muster.de\n' +
        'Start: Noch offen\nIhre Themen: Excel-Chaos\n\nBitte mit Rückruf.',
    });
  });

  it('schickt ohne Freitext trotzdem eine Nachricht, die der Server annimmt', () => {
    component.toggleTopic('app');

    component.submit(formWith());

    const message: string = sendContact.calls.mostRecent().args[0].message;
    expect(message.length).toBeGreaterThanOrEqual(10);
  });

  it('nimmt Angaben eines abgewaehlten Themas nicht mit', () => {
    component.toggleTopic('app');
    component.toggle('features', 'Zahlungen');
    component.toggleTopic('app');
    component.toggleTopic('web');

    component.submit(formWith());

    expect(sendContact.calls.mostRecent().args[0].message).not.toContain('Zahlungen');
  });

  it('nennt die Kennenlernaktion als Anlass', () => {
    component.startFromOffer();

    component.submit(formWith());

    expect(sendContact.calls.mostRecent().args[0].message).toContain('Anlass: Kennenlernaktion');
  });

  it('sendet bei Eingabefehlern nichts und sagt, woran es liegt', () => {
    component.toggleTopic('web');

    component.submit(formWith({ email: { email: true } }));

    expect(sendContact).not.toHaveBeenCalled();
    expect(component.fieldErrors()['email']).toContain('gültige');
  });

  it('zeigt nach dem Senden das Danke und leert alles', () => {
    component.toggleTopic('web');
    component.name = 'Max Muster';

    component.submit(formWith());
    fixture.detectChanges();

    expect(component.step()).toBe(4);
    expect(query('.thanks')).not.toBeNull();
    expect(component.name).toBe('');
    expect(component.selectedTopics()).toEqual([]);
  });

  it('behaelt bei einem Serverfehler die Eingaben und bleibt auf dem Schritt', () => {
    sendContact.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    component.toggleTopic('web');
    component.step.set(3);
    component.name = 'Max Muster';

    component.submit(formWith());

    expect(component.step()).toBe(3);
    expect(component.name).toBe('Max Muster');
    expect(component.errorMessage()).toContain('business@kielstack.de');
  });
});
