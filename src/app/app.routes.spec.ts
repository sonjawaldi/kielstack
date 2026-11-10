import { UrlSegment } from '@angular/router';
import { LEGAL_SECTIONS, SECTIONS, homeMatcher, legalMatcher } from './app.routes';

function segments(...paths: string[]): UrlSegment[] {
  return paths.map((path) => new UrlSegment(path, {}));
}

describe('homeMatcher', () => {
  it('matcht die Startseite ohne Segment zu verbrauchen', () => {
    expect(homeMatcher(segments())).toEqual({ consumed: [] });
  });

  it('matcht jeden Abschnitt und reicht ihn als section-Param weiter', () => {
    for (const section of SECTIONS) {
      const result = homeMatcher(segments(section));

      expect(result).withContext(section).not.toBeNull();
      expect(result!.posParams!['section'].path).toBe(section);
    }
  });

  it('matcht unbekannte Pfade nicht, damit die 404-Seite greift', () => {
    expect(homeMatcher(segments('gibtsnicht'))).toBeNull();
  });

  it('matcht keine tieferen Pfade', () => {
    expect(homeMatcher(segments('kontakt', 'formular'))).toBeNull();
  });
});

describe('legalMatcher', () => {
  it('matcht /rechtliches ohne Abschnitt', () => {
    const result = legalMatcher(segments('rechtliches'));

    expect(result).not.toBeNull();
    expect(result!.posParams).toBeUndefined();
  });

  it('matcht Impressum, Datenschutz und Barrierefreiheit als Abschnitt', () => {
    for (const section of LEGAL_SECTIONS) {
      const result = legalMatcher(segments(section));

      expect(result).withContext(section).not.toBeNull();
      expect(result!.posParams!['section'].path).toBe(section);
    }
  });

  it('ueberschneidet sich nicht mit der Startseite', () => {
    expect(legalMatcher(segments())).toBeNull();
    expect(legalMatcher(segments('kontakt'))).toBeNull();
    expect(legalMatcher(segments('impressum', 'alt'))).toBeNull();
  });
});
