import { DOCUMENT } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ContactService, describeFormError } from './services/contact.service';


// Dieselben Regeln wie im Server, damit beide Wege gleich klingen.
const FIELD_MESSAGES: Record<string, Record<string, string>> = {
  name: {
    required: 'Bitte einen Namen angeben.',
    minlength: 'Name muss mindestens 2 Zeichen lang sein.',
  },
  email: {
    required: 'Bitte eine E-Mail-Adresse angeben.',
    email: 'Bitte eine gültige E-Mail-Adresse angeben.',
  },
  message: {
    required: 'Bitte eine Nachricht eingeben.',
    minlength: 'Nachricht muss mindestens 10 Zeichen lang sein.',
  },
};

function collectClientErrors(form: NgForm): Record<string, string> {
  const found: Record<string, string> = {};

  for (const [field, messages] of Object.entries(FIELD_MESSAGES)) {
    const errors = form.controls[field]?.errors;
    if (!errors) continue;

    const key = Object.keys(errors).find((name) => messages[name]);
    if (key) found[field] = messages[key];
  }

  return found;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly contactService = inject(ContactService);

  readonly menuOpen = signal(false);
  readonly darkMode = signal(true);

  name = '';
  email = '';
  message = '';
  /** Honeypot - für Menschen unsichtbar, Bots füllen ihn aus. */
  website = '';

  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly errorMessage = signal('');
  readonly fieldErrors = signal<Record<string, string>>({});

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.document.documentElement.classList.add('dark');
  }

  toggleTheme(): void {
    this.darkMode.update((value) => !value);
    this.document.documentElement.classList.toggle('dark', this.darkMode());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  submitContact(form: NgForm): void {
    if (this.sending()) return;

    // Erst hier prüfen, nicht per disabled am Button: ein stummer, grauer
    // Button verrät nicht, welches Feld ihn blockiert. Und der Server lässt
    // nur fünf Anfragen je Viertelstunde zu – ein Tippfehler soll davon
    // keine verbrauchen.
    const clientErrors = collectClientErrors(form);
    if (Object.keys(clientErrors).length > 0) {
      form.control.markAllAsTouched();
      this.sent.set(false);
      this.fieldErrors.set(clientErrors);
      this.errorMessage.set('Bitte prüfen Sie die markierten Felder.');
      return;
    }

    this.sending.set(true);
    this.errorMessage.set('');
    this.fieldErrors.set({});

    this.contactService
      .sendContact({
        name: this.name,
        email: this.email,
        message: this.message,
        website: this.website,
      })
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.sent.set(true);
          this.resetForm();
        },
        error: (error: HttpErrorResponse) => {
          this.sending.set(false);
          const described = describeFormError(error);
          this.errorMessage.set(described.message);
          this.fieldErrors.set(described.fieldErrors);
        },
      });
  }

  private resetForm(): void {
    this.name = '';
    this.email = '';
    this.message = '';
    this.website = '';
  }
}
