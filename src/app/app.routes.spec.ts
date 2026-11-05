import { UrlSegment } from '@angular/router';
import { SECTIONS, homeMatcher } from './app.routes';

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
