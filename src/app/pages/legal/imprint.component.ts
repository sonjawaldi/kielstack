import { Component } from '@angular/core';
import { scrollToTop } from './scroll-top';

@Component({
  selector: 'app-imprint',
  standalone: true,
  template: `
    <section>
      <div class="wrap legal">
        <h1 class="h1">Impressum</h1>

        <section>
          <h2>Angaben gemäß § 5 DDG</h2>
          <p>
            <strong>Kielstack – Sonja Waldenspuhl</strong><br />
            Charles-Roß-Ring 20<br />
            24106 Kiel
          </p>
        </section>

        <section>
          <h2>Kontakt</h2>
          <p>E-Mail: <a href="mailto:business&#64;kielstack.de">business&#64;kielstack.de</a></p>
        </section>

        <section>
          <h2>Haftung für Links</h2>
          <p>
            Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen
            Einfluss habe. Für diese fremden Inhalte ist stets der jeweilige Anbieter oder Betreiber
            der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
            mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren zu diesem Zeitpunkt nicht
            erkennbar. Sobald mir Rechtsverletzungen bekannt werden, entferne ich derartige Links
            umgehend.
          </p>
        </section>

        <section>
          <h2>Rechtsgrundlage</h2>
          <p>
            Die Anbieterkennzeichnung erfolgt nach
            <a href="https://www.gesetze-im-internet.de/ddg/__5.html" target="_blank" rel="noopener noreferrer"
              >§ 5 Digitale-Dienste-Gesetz (DDG)<span class="sr-only"> (öffnet in neuem Tab)</span></a
            >.
          </p>
        </section>
      </div>
    </section>
  `,
})
export class ImprintComponent {
  constructor() {
    scrollToTop();
  }
}
