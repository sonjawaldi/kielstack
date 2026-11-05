import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, signal } from '@angular/core';

/** Karte im Hero: wechselt von selbst durch die drei Schritte, bis jemand einen anklickt. */
@Component({
  selector: 'app-workspace-card',
  standalone: true,
  template: `
    <div
      class="panel"
      (mouseenter)="held = true"
      (mouseleave)="held = false"
      (focusin)="held = true"
      (focusout)="held = false"
    >
      <div class="panel-top">
        <div class="dots" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="panel-title">
          <span>kielstack / workspace</span>
          <button
            type="button"
            class="ws-toggle"
            [attr.aria-label]="
              cycling() ? 'Automatischen Wechsel anhalten' : 'Automatischen Wechsel starten'
            "
            (click)="toggleCycling()"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              @if (cycling()) {
                <path d="M9 6v12M15 6v12"></path>
              } @else {
                <path d="M8 5l11 7-11 7z"></path>
              }
            </svg>
          </button>
        </div>
      </div>
      <div class="panel-body">
        <div class="panel-head">
          <span class="eyebrow">Ihr nächster Schritt</span>
          <h2>Von komplex zu klar.</h2>
        </div>

        <div class="ws-steps">
          @for (label of steps; track label; let i = $index) {
            <button
              type="button"
              [class.on]="step() === i"
              [attr.aria-pressed]="step() === i"
              (click)="pick(i)"
            >
              <span class="n">{{ i + 1 }}</span>
              <span class="l">{{ label }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
            </button>
          }
        </div>

        <!-- Nur ansagen, was jemand selbst gewaehlt hat: der automatische Wechsel
             wuerde Screenreader sonst alle paar Sekunden unterbrechen. -->
        <div class="ws-preview" [attr.aria-live]="cycling() ? 'off' : 'polite'">
          @switch (step()) {
            @case (0) {
              <div class="ws-in ws-notes">
                <small>Notizen aus dem Erstgespräch</small>
                <p><b>Ziel</b>Mehr Anfragen über die Website</p>
                <p><b>Wer</b>Privatkundschaft in Kiel und Umgebung</p>
                <p><b>Engpass</b>Termine laufen nur per Telefon</p>
              </div>
            }
            @case (1) {
              <div class="ws-in ws-code">
                <pre><span class="c1">&lt;ks-terminbuchung</span>
  <span class="c2">[schritte]</span>=<span class="c3">"3"</span>
  <span class="c2">[erinnerung]</span>=<span class="c3">"true"</span>
  <span class="c2">(gebucht)</span>=<span class="c3">"speichern($event)"</span> <span class="c1">/&gt;</span></pre>
                <div class="ws-build">
                  <span>Build</span><span class="bar"><i></i></span><span>72 %</span>
                </div>
              </div>
            }
            @case (2) {
              <div class="ws-in ws-live">
                <div class="ws-live-top">
                  <b><i class="pulse" aria-hidden="true"></i>Live</b>
                  <small>ihre-firma.de</small>
                </div>
                <div class="ws-booking">
                  <span class="card-icon" aria-hidden="true">
                    <svg class="icon" viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="16" rx="2"></rect>
                      <path d="M3 10h18M8 3v4M16 3v4"></path>
                    </svg>
                  </span>
                  <div>
                    <b>Neue Online-Buchung</b>
                    <small>Dienstag, 10:30 Uhr · gerade eben</small>
                  </div>
                </div>
                <div class="ws-tags">
                  <span>Mobil optimiert</span><span>Barrierearm</span>
                </div>
              </div>
            }
          }
        </div>

        <div class="person">
          <img src="assets/sonja-waldenspuhl-avatar.jpg" alt="" width="160" height="160" />
          <div>
            <span>Sonja Waldenspuhl</span>
            <small>Ihre direkte Ansprechpartnerin</small>
          </div>
          <span class="badge">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"></path></svg>
            Moin. Läuft.
          </span>
        </div>
      </div>
    </div>
  `,
})
export class WorkspaceCardComponent implements OnInit, OnDestroy {
  readonly steps = ['Bedarf verstehen', 'Lösung entwickeln', 'Wirkung erzielen'];
  readonly step = signal(0);
  readonly cycling = signal(false);

  /** Maus oder Tastaturfokus auf der Karte: solange wird gelesen, nicht gewechselt. */
  held = false;

  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    const reduceMotion = this.document.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!reduceMotion) this.startCycling();
  }

  ngOnDestroy(): void {
    this.stopCycling();
  }

  /** Wer einen Schritt anklickt, will ihn lesen - der Wechsel haelt dann an. */
  pick(index: number): void {
    this.stopCycling();
    this.step.set(index);
  }

  toggleCycling(): void {
    if (this.cycling()) {
      this.stopCycling();
    } else {
      this.startCycling();
    }
  }

  private startCycling(): void {
    this.cycling.set(true);
    this.timer = setInterval(() => {
      if (!this.held) this.step.update((step) => (step + 1) % this.steps.length);
    }, 4000);
  }

  private stopCycling(): void {
    this.cycling.set(false);
    clearInterval(this.timer);
  }
}
