import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

const TITLES: Record<string, string> = {
  impressum: 'Impressum',
  datenschutz: 'Datenschutz',
  barrierefreiheit: 'Barrierefreiheit',
};

/** Impressum (§ 5 DDG), Datenschutzerklärung und Barrierefreiheit auf einer Seite. */
@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal.component.html',
})
export class LegalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  /** Stand der Texte; bei jeder inhaltlichen Aenderung mitziehen. */
  readonly updated = 'November 2026';

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    // Die anderen Seiten setzen keinen Titel, also beim Verlassen den aus index.html zurueckholen.
    const pageTitle = this.title.getTitle();
    this.destroyRef.onDestroy(() => this.title.setTitle(pageTitle));

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

  private show(section: string | undefined): void {
    const name = section ? TITLES[section] : 'Rechtliches';
    this.title.setTitle(`${name} | Kielstack`);

    // Der Router stellt keine Scrollposition her: wer vom Footer der Startseite
    // kommt, stuende sonst mitten in der Seite. Erst im naechsten Frame, weil
    // das Template beim ersten Aufruf noch nicht im DOM steht.
    requestAnimationFrame(() => {
      const view = this.document.defaultView;
      const target = section ? this.document.getElementById(section) : null;

      if (target) {
        // scroll-padding-top auf html haelt die Ueberschrift unter dem Header frei.
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        view?.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }
}
