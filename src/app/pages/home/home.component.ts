import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  Inject,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { InquiryFormComponent } from './inquiry-form.component';
import { WorkspaceCardComponent } from './workspace-card.component';

const PROBLEMS = [
  {
    id: 'web',
    label: 'Website von 2015',
    quote: 'Unsere Website ist von 2015.',
    text: 'Auf dem Handy kaum bedienbar und bei Google schwer zu finden.',
    solution: 'Eine schnelle, moderne Website.',
  },
  {
    id: 'excel',
    label: 'Excel-Chaos',
    quote: 'Welche Excel-Liste ist die aktuelle?',
    text: 'Kunden, Aufträge und Termine liegen verteilt in mehreren Dateien.',
    solution: 'Eine zentrale Webanwendung statt Dateichaos – alle sehen denselben Stand.',
  },
  {
    id: 'phone',
    label: 'Termine nur per Telefon',
    quote: 'Termine laufen nur übers Telefon.',
    text: 'Rückrufe und Absprachen kosten jeden Tag Zeit.',
    solution: 'Online-Anfragen und -Buchungen, die sortiert bei Ihnen ankommen.',
  },
  {
    id: 'copy',
    label: 'Daten abtippen',
    quote: 'Das tippen wir jedes Mal ab.',
    text: 'Daten wandern per Copy-and-paste zwischen Programmen hin und her.',
    solution: 'Automatisierungen, die Ihre Systeme verbinden – ohne Abtippen.',
  },
];

const SERVICES = [
  {
    label: '01 · ENTWICKLUNG',
    title: 'Websites & Webanwendungen',
    text: 'Schnelle Unternehmensseiten, Kundenportale und individuelle Anwendungen – responsive, barrierearm und wartbar.',
    icon: 'M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM3 9h18',
  },
  {
    label: '02 · EFFIZIENZ',
    title: 'Prozesse & Automatisierung',
    text: 'Weniger Copy-and-paste, weniger Fehler: Ich verbinde Systeme und automatisiere wiederkehrende Arbeitsschritte.',
    icon: 'M4 12a8 8 0 0 1 14-5.3M18 3v4h-4M20 12a8 8 0 0 1-14 5.3M6 21v-4h4',
  },
  {
    label: '03 · PRODUKT',
    title: 'Konzeption & Prototyping',
    text: 'Aus einer Idee wird ein testbares Produkt: mit klaren Anforderungen, fokussiertem Prototyp und sinnvoller Roadmap.',
    icon: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
  },
  {
    label: '04 · BETRIEB',
    title: 'Weiterentwicklung & Support',
    text: 'Nach dem Launch bleibe ich erreichbar – für Updates, neue Funktionen, Monitoring und technische Fragen.',
    icon: 'M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7zM9 12l2 2 4-4',
  },
];

const FAQS = [
  {
    question: 'Was kostet eine Website bei Kielstack?',
    answer:
      'Im Kennenlernangebot ist die Erstellung kostenlos – Sie tragen nur Domain und Hosting. Für alle anderen Projekte bekommen Sie nach dem Erstgespräch ein transparentes Angebot, bevor irgendetwas losgeht.',
  },
  {
    question: 'Wie lange dauert ein Projekt?',
    answer:
      'Das hängt vom Umfang ab. Im Erstgespräch legen wir einen Zeitplan fest – realistisch statt geschönt – und Sie sehen unterwegs regelmäßig den Zwischenstand.',
  },
  {
    question: 'Arbeiten Sie nur mit Betrieben aus Kiel?',
    answer:
      'In Kiel und Umgebung komme ich gern persönlich vorbei. Alles andere klappt genauso gut per Telefon oder Video.',
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, WorkspaceCardComponent, InquiryFormComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly inquiry = viewChild.required(InquiryFormComponent);

  readonly services = SERVICES;
  readonly problems = PROBLEMS;
  readonly faqs = FAQS;
  readonly trust = ['Persönliche Begleitung', 'Transparentes Vorgehen', 'Sauber dokumentiert'];
  readonly offerIncluded = [
    'Einmalige, kostenlose Erstellung als Kennenlernaktion',
    'Bis zu 5 Seiten, modern und fürs Handy optimiert',
    'Domain und Hosting zahlen Sie selbst',
    'Ein dezenter Hinweis „Kielstack – Sonja Waldenspuhl“ im Footer',
    'Erster Entwurf und zwei Korrekturschleifen, weitere Änderungen für 65 €/h',
    'Texte und Bilder liefern Sie innerhalb von 4 Wochen nach dem Startgespräch',
    'Optional danach: Pflege, Updates und kleine Änderungen im Pflegepaket ab 49 €/Monat',
  ];
  readonly offerExcluded = [
    'Ohne Shops, Buchungssysteme oder Kundenportale',
    'Nicht für größere Organisationen und Verbände',
  ];

  readonly selectedPains = signal<readonly string[]>([]);
  readonly painLabels = computed(() =>
    PROBLEMS.filter((problem) => this.selectedPains().includes(problem.id)).map(
      (problem) => problem.label,
    ),
  );
  readonly openFaq = signal<number | null>(0);

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    // Auf NavigationEnd hoeren statt auf route.params: der Router laeuft mit
    // onSameUrlNavigation 'reload', damit ein zweiter Klick auf 'Kontakt' auch
    // dann wieder hinscrollt, wenn man zwischendurch weggescrollt ist -
    // params wuerde bei unveraendertem Wert nichts mehr melden.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.scrollToSection(this.route.snapshot.params['section']));

    this.scrollToSection(this.route.snapshot.params['section']);
  }

  private scrollToSection(id: string | undefined): void {
    // Beim ersten Aufruf von aussen (kielstack.de/kontakt) laeuft ngOnInit,
    // bevor das Template im DOM steht - deshalb erst im naechsten Frame suchen.
    requestAnimationFrame(() => {
      if (!id) {
        this.document.defaultView?.scrollTo({ top: 0 });
        return;
      }

      this.document.getElementById(id)?.scrollIntoView({ block: 'start' });
    });
  }

  togglePain(id: string): void {
    this.selectedPains.update((current) =>
      current.includes(id) ? current.filter((pain) => pain !== id) : [...current, id],
    );
  }

  toggleFaq(index: number): void {
    this.openFaq.update((open) => (open === index ? null : index));
  }

  /** Uebernimmt das Kennenlernangebot in die Anfrage und springt dorthin. */
  requestOfferAppointment(): void {
    this.inquiry().startFromOffer();
    void this.router.navigateByUrl('/kontakt').then(() => this.inquiry().focusStep());
  }
}
