import { DOCUMENT } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  DestroyRef,
  Inject,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

const TITLES: Record<string, string> = {
  impressum: 'Impressum',
  datenschutz: 'Datenschutz',
  barrierefreiheit: 'Barrierefreiheit',
};

type WidgetKey = 'imprint' | 'privacy';

/**
 * Impressum und Datenschutzerklaerung werden bei PrivacyBee gepflegt. Jedes
 * Skript registriert ein Custom Element, das sich den Text selbst holt.
 */
export const PRIVACYBEE_WIDGETS: readonly { key: WidgetKey; src: string; element: string }[] = [
  {
    key: 'imprint',
    src: 'https://app.privacybee.io/imprint-widget.js',
    element: 'imprint-widget',
  },
  { key: 'privacy', src: 'https://app.privacybee.io/widget.js', element: 'privacybee-widget' },
];

/** So lange haelt die Seite einen angesprungenen Abschnitt fest, waehrend die Widgets nachladen. */
const ANCHOR_HOLD_MS = 4000;

/** Impressum (§ 5 DDG), Barrierefreiheit und Datenschutzerklaerung auf einer Seite. */
@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink],
  // <imprint-widget> und <privacybee-widget> kommen aus den PrivacyBee-Skripten.
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './legal.component.html',
})
export class LegalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  /** Stand der eigenen Texte; bei jeder inhaltlichen Aenderung mitziehen. */
  readonly updated = 'November 2026';

  /** Widgets, deren Skript nicht geladen werden konnte - dann zeigt die Seite einen Ersatz. */
  readonly failed = signal<Record<WidgetKey, boolean>>({ imprint: false, privacy: false });

  private releaseAnchor?: () => void;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    // Die anderen Seiten setzen keinen Titel, also beim Verlassen den aus index.html zurueckholen.
    const pageTitle = this.title.getTitle();
    this.destroyRef.onDestroy(() => {
      this.title.setTitle(pageTitle);
      this.releaseAnchor?.();
    });

    for (const widget of PRIVACYBEE_WIDGETS) this.loadWidget(widget);

    // Wie auf der Startseite: Wechsel zwischen /impressum und /datenschutz
    // bauen die Seite nicht neu auf, also bei jeder Navigation selbst springen.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.show(this.route.snapshot.params['section']));

    this.show(this.route.snapshot.params['section']);
  }

  /**
   * Laedt ein Widget-Skript nur hier statt in index.html: Die uebrigen Seiten
   * sollen keine Verbindung zu PrivacyBee aufbauen.
   *
   * Beim zweiten Besuch der Seite gilt: Ist das Element schon als Custom
   * Element registriert, rendert sich das neue Element von selbst. Sonst wird
   * das Skript neu eingefuegt, falls es die Seite nur beim Laden durchsucht.
   */
  private loadWidget({ key, src, element }: (typeof PRIVACYBEE_WIDGETS)[number]): void {
    if (this.document.defaultView?.customElements?.get(element)) return;

    this.document.querySelector(`script[src="${src}"]`)?.remove();

    const script = this.document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onerror = () => this.failed.update((failed) => ({ ...failed, [key]: true }));
    this.document.head.appendChild(script);
  }

  private show(section: string | undefined): void {
    const name = section ? TITLES[section] : 'Rechtliches';
    this.title.setTitle(`${name} | Kielstack`);
    this.releaseAnchor?.();

    // Der Router stellt keine Scrollposition her: wer vom Footer der Startseite
    // kommt, stuende sonst mitten in der Seite. Erst im naechsten Frame, weil
    // das Template beim ersten Aufruf noch nicht im DOM steht.
    requestAnimationFrame(() => {
      const view = this.document.defaultView;
      const target = section ? this.document.getElementById(section) : null;

      if (target) {
        this.scrollTo(target);
        this.holdAnchor(target);
      } else {
        view?.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }

  private scrollTo(target: HTMLElement): void {
    // scroll-padding-top auf html haelt die Ueberschrift unter dem Header frei.
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  /**
   * Der Impressum-Text kommt erst nach dem Sprung und schiebt alles darunter
   * nach unten. Solange die Seite dadurch waechst, bleibt der angesprungene
   * Abschnitt oben - bis jemand selbst scrollt oder die Zeit um ist.
   */
  private holdAnchor(target: HTMLElement): void {
    const view = this.document.defaultView;
    const content = target.parentElement;
    if (!view || !content || typeof ResizeObserver === 'undefined') return;

    const userScrollEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
    const observer = new ResizeObserver(() => this.scrollTo(target));
    const release = () => {
      observer.disconnect();
      view.clearTimeout(timer);
      for (const type of userScrollEvents) view.removeEventListener(type, release);
      if (this.releaseAnchor === release) this.releaseAnchor = undefined;
    };
    const timer = view.setTimeout(release, ANCHOR_HOLD_MS);

    for (const type of userScrollEvents) view.addEventListener(type, release, { passive: true });
    observer.observe(content);
    this.releaseAnchor = release;
  }
}
