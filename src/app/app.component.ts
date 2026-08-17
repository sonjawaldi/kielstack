import { DOCUMENT } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ContactService, describeFormError } from './services/contact.service';

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

  submitContact(): void {
    if (this.sending()) return;

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
