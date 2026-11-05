import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { BookingComponent } from './booking.component';

const RESPONSE = {
  timeZone: 'Europe/Berlin',
  slotMinutes: 30,
  slots: ['2026-11-09T09:00:00.000Z', '2026-11-09T09:30:00.000Z', '2026-11-10T14:00:00.000Z'],
};

describe('BookingComponent', () => {
  let fixture: ComponentFixture<BookingComponent>;
  let component: BookingComponent;
  let loadSlots: jasmine.Spy;
  let requestAppointment: jasmine.Spy;

  const validForm = { controls: {} } as unknown as NgForm;

  function create(): void {
    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(async () => {
    loadSlots = jasmine.createSpy('loadSlots').and.returnValue(of(RESPONSE));
    requestAppointment = jasmine.createSpy('requestAppointment').and.returnValue(of({ ok: true }));

    await TestBed.configureTestingModule({
      imports: [BookingComponent],
      providers: [{ provide: BookingService, useValue: { loadSlots, requestAppointment } }],
    }).compileComponents();
  });

  it('gruppiert Slots nach Tag und zeigt sie in Berliner Zeit', () => {
    create();

    expect(component.days().length).toBe(2);
    expect(component.days()[0].slots.map((slot) => slot.time)).toEqual(['10:00', '10:30']);
    expect(text()).toContain('10:30');
  });

  it('zeigt die Kontaktfelder erst nach der Wahl einer Uhrzeit', () => {
    create();
    expect(fixture.nativeElement.querySelector('#booking-email')).toBeNull();

    component.start.set(RESPONSE.slots[0]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#booking-email')).not.toBeNull();
  });

  it('verwirft die Uhrzeit beim Wechsel des Tages', () => {
    create();
    component.start.set(RESPONSE.slots[0]);

    component.chooseDay(component.days()[1].key);

    expect(component.start()).toBeNull();
  });

  it('sendet den gewaehlten Termin und bedankt sich', () => {
    create();
    component.start.set(RESPONSE.slots[1]);
    component.name = 'Erika Muster';
    component.email = 'erika@example.com';

    component.submit(validForm);
    fixture.detectChanges();

    expect(requestAppointment).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'Erika Muster', start: RESPONSE.slots[1] }),
    );
    expect(text()).toContain('Terminanfrage ist da');
    expect(text()).toContain('10:30');
  });

  it('laedt neu und behaelt die Eingaben, wenn der Termin vergeben wurde', () => {
    create();
    component.start.set(RESPONSE.slots[0]);
    component.name = 'Erika Muster';
    requestAppointment.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );

    component.submit(validForm);
    fixture.detectChanges();

    expect(loadSlots).toHaveBeenCalledTimes(2);
    expect(component.start()).toBeNull();
    expect(component.name).toBe('Erika Muster');
    expect(text()).toContain('vergeben');
  });

  it('bietet das Anfrageformular an, wenn der Kalender nicht antwortet', () => {
    loadSlots.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    create();
    const switched = jasmine.createSpy('switched');
    component.switchToInquiry.subscribe(switched);

    (fixture.nativeElement.querySelector('.btn-p') as HTMLButtonElement).click();

    expect(text()).toContain('nicht laden');
    expect(switched).toHaveBeenCalled();
  });

  it('sagt es offen, wenn kein Termin frei ist', () => {
    loadSlots.and.returnValue(of({ ...RESPONSE, slots: [] }));
    create();

    expect(text()).toContain('kein Termin frei');
  });
});
