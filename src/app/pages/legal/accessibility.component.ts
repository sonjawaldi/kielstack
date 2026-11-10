import { Component } from '@angular/core';
import { scrollToTop } from './scroll-top';

@Component({
  selector: 'app-accessibility',
  standalone: true,
  template: `
    <section>
      <div class="wrap legal">
        <h1 class="h1">Barrierefreiheit</h1>
        <p>
          Diese Website informiert über digitale Beratungs- und Entwicklungsleistungen von Kielstack.
          Interessierte können die Leistungen kennenlernen und über E-Mail, ein Kontaktformular oder
          die Terminbuchung unverbindlich Kontakt aufnehmen.
        </p>

        <section>
          <h2>Barrierefreie Nutzung</h2>
          <p>
            Die Website ist für die Bedienung mit Tastatur und assistiven Technologien ausgelegt. Sie
            bietet eine logische Überschriftenstruktur, sichtbare Fokusmarkierungen, beschriftete
            Formulare, Alternativtexte, vergrößerbare Inhalte, einen Hell- und Dunkelmodus und eine
            reduzierte Darstellung von Bewegungen entsprechend den Geräteeinstellungen.
          </p>
        </section>

        <section>
          <h2>Stand der Vereinbarkeit</h2>
          <p>
            Ziel ist die Vereinbarkeit mit den Anforderungen des Barrierefreiheitsstärkungsgesetzes
            und der Verordnung zum Barrierefreiheitsstärkungsgesetz auf Grundlage der europäischen
            Norm EN 301 549 und WCAG 2.2 auf Konformitätsstufe AA. Die Website wird bei Änderungen
            erneut geprüft.
          </p>
          <p>Stand: 10. November 2026</p>
        </section>

        <section>
          <h2>Barriere melden</h2>
          <p>
            Falls Sie auf eine Barriere stoßen oder Informationen in einer anderen zugänglichen Form
            benötigen, schreiben Sie bitte an
            <a href="mailto:business@kielstack.de?subject=Hinweis%20zur%20Barrierefreiheit"
              >business&#64;kielstack.de</a
            >. Bitte nennen Sie möglichst die betroffene Seite und beschreiben Sie das Problem.
          </p>
        </section>

        <section>
          <h2>Marktüberwachungsbehörde</h2>
          <p>
            Zuständig ist die Marktüberwachungsstelle der Länder für die Barrierefreiheit von
            Produkten und Dienstleistungen (MLBF AöR). Informationen und das Kontaktformular für
            Verbraucherinnen und Verbraucher finden Sie auf der
            <a href="https://www.mlbf-barrierefrei.de/" target="_blank" rel="noopener noreferrer"
              >Website der MLBF<span class="sr-only"> (öffnet in neuem Tab)</span></a
            >.
          </p>
        </section>
      </div>
    </section>
  `,
})
export class AccessibilityComponent {
  constructor() {
    scrollToTop();
  }
}
