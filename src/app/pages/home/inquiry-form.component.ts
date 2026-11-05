import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService, describeFormError } from '../../services/contact.service';

const TOPICS = [
  { id: 'web', label: 'Neue Website', desc: 'Unternehmensseite von Grund auf' },
  { id: 'redo', label: 'Website modernisieren', desc: 'Bestehende Seite neu aufsetzen' },
  { id: 'app', label: 'Webanwendung', desc: 'Portal, Tool oder Verwaltung' },
  { id: 'auto', label: 'Automatisierung', desc: 'Abläufe und Systeme verbinden' },
] as const;
export type TopicId = (typeof TOPICS)[number]['id'];

const PAGES = ['1–3 Seiten', '4–5 Seiten', 'Mehr als 5'];
const FEATURES = ['Nutzerkonten & Login', 'Termine & Buchungen', 'Zahlungen', 'Datenverwaltung'];
const TOOLS = ['E-Mail', 'Excel & Tabellen', 'CRM', 'Buchhaltung', 'Sonstiges'];
const TIMES = ['So bald wie möglich', 'In 1–3 Monaten', 'Noch offen'];
const STEP_NAMES = ['Thema', 'Details', 'Kontakt'];

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
  selector: 'app-inquiry-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './inquiry-form.component.html',
})
export class InquiryFormComponent {
  private readonly contactService = inject(ContactService);

  /** Was in "Kommt Ihnen das bekannt vor?" angetippt wurde. */
  readonly pains = input<string[]>([]);
  /** Die Themen, die zu diesen Punkten passen. Sie werden in Schritt 1 vorausgewählt. */
  readonly painTopics = input<readonly TopicId[]>([]);

  readonly topics = TOPICS;
  readonly pageOptions = PAGES;
  readonly featureOptions = FEATURES;
  readonly toolOptions = TOOLS;
  readonly timeOptions = TIMES;
  readonly segments = [1, 2, 3];

  /** 1-3 sind die Schritte, 4 das Danke. */
  readonly step = signal(1);
  readonly selectedTopics = signal<readonly TopicId[]>([]);
  readonly pages = signal<string | null>(null);
  readonly time = signal<string | null>(null);
  readonly features = signal<string[]>([]);
  readonly tools = signal<string[]>([]);
  readonly fromOffer = signal(false);

  readonly stepName = computed(() => STEP_NAMES[this.step() - 1]);
  readonly isSite = computed(() => this.hasTopic('web') || this.hasTopic('redo'));
  readonly offerFits = computed(
    () => this.isSite() && (this.pages() === PAGES[0] || this.pages() === PAGES[1]),
  );
  readonly summary = computed(() => {
    const parts: (string | undefined)[] = [this.topicLabels()];
    if (this.isSite()) parts.push(this.pages() ?? undefined);
    if (this.hasTopic('app')) parts.push(this.features().join(', '));
    if (this.hasTopic('auto')) parts.push(this.tools().join(', '));
    parts.push(this.time() ?? undefined);
    return parts.filter(Boolean).join(' · ');
  });

  currentSite = '';
  name = '';
  email = '';
  note = '';
  /** Honeypot - für Menschen unsichtbar, Bots füllen ihn aus. */
  website = '';

  readonly sending = signal(false);
  readonly topicError = signal(false);
  readonly errorMessage = signal('');
  readonly fieldErrors = signal<Record<string, string>>({});

  /** Zuletzt übernommene Themen, damit nur Änderungen die Auswahl von Hand überschreiben. */
  private appliedPainTopics: readonly TopicId[] = [];

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    effect(() => this.applyPainTopics(this.painTopics()));
  }

  /** Kommt von der Kennenlernaktion: das Thema steht damit fest, der Rest bleibt offen. */
  startFromOffer(): void {
    this.reset();
    this.fromOffer.set(true);
    this.selectedTopics.set(['web']);
  }

  hasTopic(id: TopicId): boolean {
    return this.selectedTopics().includes(id);
  }

  toggleTopic(id: TopicId): void {
    this.selectedTopics.update((current) =>
      current.includes(id) ? current.filter((topic) => topic !== id) : [...current, id],
    );
    this.topicError.set(false);
  }

  toggle(list: 'features' | 'tools', value: string): void {
    this[list].update((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  next(): void {
    // Kein disabled am Button: ein stummer, grauer Button verrät nicht, was fehlt.
    if (this.sendBackWithoutTopic()) return;

    this.goTo(Math.min(this.step() + 1, 3));
  }

  back(): void {
    this.errorMessage.set('');
    this.fieldErrors.set({});
    this.goTo(Math.max(this.step() - 1, 1));
  }

  submit(form: NgForm): void {
    if (this.sending()) return;
    if (this.sendBackWithoutTopic()) return;

    // Der Server lässt nur fünf Anfragen je Viertelstunde zu – ein Tippfehler
    // soll davon keine verbrauchen.
    const clientErrors = collectClientErrors(form);
    if (Object.keys(clientErrors).length > 0) {
      form.control.markAllAsTouched();
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
        message: this.buildMessage(),
        website: this.website,
      })
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.reset();
          this.goTo(4);
        },
        error: (error: HttpErrorResponse) => {
          this.sending.set(false);
          const described = describeFormError(error);
          this.errorMessage.set(described.message);
          this.fieldErrors.set(described.fieldErrors);
        },
      });
  }

  restart(): void {
    this.reset();
    this.goTo(1);
  }

  /** Setzt den Cursor auf die Überschrift des aktuellen Schritts. */
  focusStep(): void {
    requestAnimationFrame(() =>
      this.document.getElementById('inquiry-heading')?.focus({ preventScroll: true }),
    );
  }

  /**
   * Der Server kennt nur ein Nachrichtenfeld. Die Auswahl steht deshalb als Text
   * darin - und weil das Thema Pflicht ist, erfuellt die Nachricht seine
   * Mindestlaenge auch dann, wenn das freie Textfeld leer bleibt.
   */
  private buildMessage(): string {
    const rows = [`Thema: ${this.topicLabels()}`];

    if (this.fromOffer()) rows.push('Anlass: Kennenlernaktion');
    if (this.isSite() && this.pages()) rows.push(`Seiten: ${this.pages()}`);
    if (this.hasTopic('redo') && this.currentSite.trim()) {
      rows.push(`Aktuelle Website: ${this.currentSite.trim()}`);
    }
    if (this.hasTopic('app') && this.features().length) {
      rows.push(`Funktionen: ${this.features().join(', ')}`);
    }
    if (this.hasTopic('auto') && this.tools().length) {
      rows.push(`Werkzeuge heute: ${this.tools().join(', ')}`);
    }
    if (this.time()) rows.push(`Start: ${this.time()}`);
    if (this.pains().length) rows.push(`Ihre Themen: ${this.pains().join(', ')}`);

    const note = this.note.trim();
    return note ? `${rows.join('\n')}\n\n${note}` : rows.join('\n');
  }

  private goTo(step: number): void {
    this.step.set(step);
    this.focusStep();
  }

  /** In fester Reihenfolge, egal in welcher Folge die Kacheln angetippt wurden. */
  private topicLabels(): string {
    return TOPICS.filter((topic) => this.hasTopic(topic.id))
      .map((topic) => topic.label)
      .join(', ');
  }

  /**
   * Punkte lassen sich auch dann noch abwählen, wenn das Formular schon weiter ist.
   * Bleibt dadurch kein Thema übrig, geht es zurück zu Schritt 1, wo die Meldung sichtbar ist.
   */
  private sendBackWithoutTopic(): boolean {
    if (this.selectedTopics().length) return false;

    this.topicError.set(true);
    this.goTo(1);
    return true;
  }

  /** Überträgt nur, was sich geändert hat: Von Hand gewählte Kacheln bleiben stehen. */
  private applyPainTopics(next: readonly TopicId[]): void {
    const previous = this.appliedPainTopics;
    this.appliedPainTopics = next;

    this.selectedTopics.update((current) => [
      ...current.filter((topic) => !previous.includes(topic) || next.includes(topic)),
      ...next.filter((topic) => !previous.includes(topic) && !current.includes(topic)),
    ]);
    if (next.length) this.topicError.set(false);
  }

  private reset(): void {
    this.step.set(1);
    this.selectedTopics.set([...this.painTopics()]);
    this.pages.set(null);
    this.time.set(null);
    this.features.set([]);
    this.tools.set([]);
    this.fromOffer.set(false);
    this.topicError.set(false);
    this.errorMessage.set('');
    this.fieldErrors.set({});
    this.currentSite = '';
    this.name = '';
    this.email = '';
    this.note = '';
    this.website = '';
  }
}
