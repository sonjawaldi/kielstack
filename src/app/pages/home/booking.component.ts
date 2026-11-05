import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, computed, inject, output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BookingService, BookingSlots } from '../../services/booking.service';
import { describeFormError } from '../../services/contact.service';

interface BookingDay {
  key: string;
  label: string;
  slots: { start: string; time: string }[];
}

function groupByDay({ slots, timeZone }: BookingSlots): BookingDay[] {
  const keyFormat = new Intl.DateTimeFormat('en-CA', { timeZone });
  const dayFormat = new Intl.DateTimeFormat('de-DE', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timeFormat = new Intl.DateTimeFormat('de-DE', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  });

  const days = new Map<string, BookingDay>();
  for (const start of slots) {
    const date = new Date(start);
    const key = keyFormat.format(date);
    if (!days.has(key)) days.set(key, { key, label: dayFormat.format(date), slots: [] });
    days.get(key)!.slots.push({ start, time: timeFormat.format(date) });
  }
  return [...days.values()];
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './booking.component.html',
})
export class BookingComponent implements OnInit {
  private readonly bookingService = inject(BookingService);

  /** Führt zum Anfrageformular, wenn kein Termin passt oder der Kalender nicht antwortet. */
  readonly switchToInquiry = output<void>();

  readonly state = signal<'loading' | 'ready' | 'failed' | 'sent'>('loading');
  readonly days = signal<BookingDay[]>([]);
  readonly slotMinutes = signal(30);
  readonly dayKey = signal<string | null>(null);
  readonly start = signal<string | null>(null);

  readonly selectedDay = computed(() => this.days().find((day) => day.key === this.dayKey()));
  readonly selectedLabel = computed(() => {
    const day = this.selectedDay();
    const slot = day?.slots.find((candidate) => candidate.start === this.start());
    return day && slot ? `${day.label}, ${slot.time} Uhr` : '';
  });

  name = '';
  email = '';
  note = '';
  /** Honeypot - für Menschen unsichtbar, Bots füllen ihn aus. */
  website = '';

  readonly sending = signal(false);
  readonly errorMessage = signal('');
  readonly fieldErrors = signal<Record<string, string>>({});

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.bookingService.loadSlots().subscribe({
      next: (response) => {
        const days = groupByDay(response);
        this.slotMinutes.set(response.slotMinutes);
        this.days.set(days);
        this.dayKey.set(days[0]?.key ?? null);
        this.start.set(null);
        this.state.set('ready');
      },
      error: () => this.state.set('failed'),
    });
  }

  chooseDay(key: string): void {
    this.dayKey.set(key);
    this.start.set(null);
  }

  submit(form: NgForm): void {
    if (this.sending()) return;

    const clientErrors: Record<string, string> = {};
    const nameErrors = form.controls['name']?.errors;
    const emailErrors = form.controls['email']?.errors;
    if (nameErrors) clientErrors['name'] = 'Bitte einen Namen mit mindestens 2 Zeichen angeben.';
    if (emailErrors) clientErrors['email'] = 'Bitte eine gültige E-Mail-Adresse angeben.';

    if (Object.keys(clientErrors).length > 0) {
      this.fieldErrors.set(clientErrors);
      this.errorMessage.set('Bitte prüfen Sie die markierten Felder.');
      return;
    }

    const start = this.start();
    if (!start) return;

    this.sending.set(true);
    this.errorMessage.set('');
    this.fieldErrors.set({});

    this.bookingService
      .requestAppointment({
        name: this.name,
        email: this.email,
        start,
        message: this.note,
        website: this.website,
      })
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.state.set('sent');
          this.focusHeading();
        },
        error: (error: HttpErrorResponse) => {
          this.sending.set(false);
          if (error.status === 409) {
            // Der Termin ist weg, die eingegebenen Daten bleiben stehen.
            this.errorMessage.set(
              'Dieser Termin ist gerade vergeben worden. Bitte wählen Sie einen anderen.',
            );
            this.load();
            return;
          }
          const described = describeFormError(error);
          this.errorMessage.set(described.message);
          this.fieldErrors.set(described.fieldErrors);
        },
      });
  }

  restart(): void {
    this.name = '';
    this.email = '';
    this.note = '';
    this.website = '';
    this.errorMessage.set('');
    this.load();
  }

  private focusHeading(): void {
    requestAnimationFrame(() =>
      this.document.getElementById('booking-heading')?.focus({ preventScroll: true }),
    );
  }
}
