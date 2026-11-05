import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ErrorComponent } from './pages/error/error.component';

/** Die Abschnitte der Startseite, die einen eigenen Pfad haben. */
export const SECTIONS = ['leistungen', 'prozess', 'ueber-mich', 'kontakt'] as const;

/**
 * Matcht die Startseite und jeden Abschnittspfad mit *einem* Route-Eintrag.
 *
 * Fuenf einzelne Eintraege waeren lesbarer, wuerden die Seite aber bei jedem
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

export const routes: Routes = [
  { matcher: homeMatcher, component: HomeComponent },
  { path: '**', component: ErrorComponent },
];
