import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ErrorComponent } from './pages/error/error.component';
import { LegalComponent } from './pages/legal/legal.component';

/** Die Abschnitte der Startseite, die einen eigenen Pfad haben. */
export const SECTIONS = ['angebot', 'leistungen', 'prozess', 'ueber-mich', 'kontakt'] as const;

/**
 * Matcht die Startseite und jeden Abschnittspfad mit *einem* Route-Eintrag.
 *
 * Einzelne Eintraege waeren lesbarer, wuerden die Seite aber bei jedem
 * Klick in der Navigation neu aufbauen: Angulars Standard-RouteReuseStrategy
 * vergleicht die routeConfig, und die ist bei jedem Eintrag eine andere. Auf
 * einem Einseiter sieht man das als Flackern, und eine halb ausgefuellte
 * Kontaktanfrage waere weg. Mit einem Eintrag bleibt die Instanz stehen und es
 * wird nur gescrollt.
 */
export function homeMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length === 0) return { consumed: [] };

  if (segments.length === 1 && (SECTIONS as readonly string[]).includes(segments[0].path)) {
    return { consumed: segments, posParams: { section: segments[0] } };
  }

  return null;
}

/**
 * Impressum, Datenschutz und Barrierefreiheit stehen zusammen auf einer Seite.
 * /rechtliches zeigt sie von oben, die drei bekannten Pfade springen direkt in
 * ihren Abschnitt - wer kielstack.de/impressum eintippt, landet also richtig.
 */
export const LEGAL_SECTIONS = ['impressum', 'datenschutz', 'barrierefreiheit'] as const;

/** Ein Eintrag fuer alle Pfade, aus demselben Grund wie bei homeMatcher. */
export function legalMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 1) return null;

  const [segment] = segments;
  if (segment.path === 'rechtliches') return { consumed: segments };
  if ((LEGAL_SECTIONS as readonly string[]).includes(segment.path)) {
    return { consumed: segments, posParams: { section: segment } };
  }

  return null;
}

export const routes: Routes = [
  { matcher: homeMatcher, component: HomeComponent },
  { matcher: legalMatcher, component: LegalComponent },
  { path: '**', component: ErrorComponent },
];
