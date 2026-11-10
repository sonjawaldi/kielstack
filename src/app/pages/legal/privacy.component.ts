import { Component } from '@angular/core';
import { scrollToTop } from './scroll-top';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <section>
      <div class="wrap legal">
        <h1 class="h1">Datenschutzerklärung</h1>

        <section>
          <h2>Verantwortliche Stelle</h2>
          <p>
            Kielstack – Sonja Waldenspuhl<br />
            Charles-Roß-Ring 20<br />
            24106 Kiel
          </p>
          <p>E-Mail: <a href="mailto:business&#64;kielstack.de">business&#64;kielstack.de</a></p>
        </section>

        <section>
          <h2>Hosting und Server-Logdateien</h2>
          <p>
            Beim Aufruf dieser Website kann der Hosting-Anbieter technisch erforderliche Daten wie
            IP-Adresse, Zeitpunkt, aufgerufene Seite, Referrer, Browser und Betriebssystem in
            Server-Logdateien verarbeiten. Die Verarbeitung erfolgt zur sicheren und zuverlässigen
            Bereitstellung der Website auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
          </p>
        </section>

        <section>
          <h2>Kontaktformular und Terminbuchung</h2>
          <p>
            Wenn Sie mir über das Kontaktformular schreiben oder einen Kennenlern-Termin buchen,
            verarbeite ich Ihren Namen, Ihre E-Mail-Adresse, Ihre Nachricht und gegebenenfalls den
            gewählten Termin. Die Angaben werden an meinen Server unter api.sonjawaldenspuhl.de
            übermittelt und ausschließlich zur Bearbeitung Ihrer Anfrage und zur Organisation des
            Termins verwendet.
          </p>
          <p>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf einen Vertrag
            oder dessen Anbahnung zielt, im Übrigen mein berechtigtes Interesse an der Beantwortung
            von Anfragen nach Art. 6 Abs. 1 lit. f DSGVO. Ich lösche die Daten, sobald sie dafür
            nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.
          </p>
        </section>

        <section>
          <h2>Keine Cookies, kein Tracking</h2>
          <p>
            Diese Website setzt keine Cookies und verwendet keine Analyse- oder Tracking-Dienste.
            Schriftarten werden vom eigenen Server geladen, nicht von Drittanbietern. Wenn Sie den
            Hell- oder Dunkelmodus umschalten, wird Ihre Wahl im lokalen Speicher Ihres Browsers
            unter <code>kielstack-theme</code> abgelegt. Diese Angabe verlässt Ihr Gerät nicht und
            ist für die von Ihnen gewünschte Darstellung erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).
          </p>
        </section>

        <section>
          <h2>Ihre Rechte</h2>
          <p>
            Sie haben im Rahmen der gesetzlichen Voraussetzungen insbesondere Rechte auf Auskunft,
            Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und
            Widerspruch. Außerdem können Sie sich bei einer Datenschutzaufsichtsbehörde beschweren,
            zum Beispiel beim Unabhängigen Landeszentrum für Datenschutz Schleswig-Holstein.
          </p>
        </section>
      </div>
    </section>
  `,
})
export class PrivacyComponent {
  constructor() {
    scrollToTop();
  }
}
