import { DOCUMENT } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

/** Derselbe Schluessel steht im Inline-Skript in index.html. */
const THEME_KEY = 'kielstack-theme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly menuOpen = signal(false);
  readonly darkMode = signal(false);

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    const systemDark = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
    const stored = this.readStoredTheme();

    this.applyTheme(stored ? stored === 'dark' : (systemDark?.matches ?? false));

    // Solange niemand selbst gewaehlt hat, folgt die Seite dem Geraet - auch
    // wenn es abends bei offenem Tab in den Dunkelmodus wechselt.
    systemDark?.addEventListener('change', (event) => {
      if (!this.readStoredTheme()) this.applyTheme(event.matches);
    });
  }

  toggleTheme(): void {
    const dark = !this.darkMode();
    this.applyTheme(dark);

    try {
      this.document.defaultView?.localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      // Gesperrter Speicher (privates Fenster): gilt dann nur bis zum Neuladen.
    }
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  private applyTheme(dark: boolean): void {
    this.darkMode.set(dark);
    this.document.documentElement.classList.toggle('dark', dark);
  }

  private readStoredTheme(): 'dark' | 'light' | null {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(THEME_KEY);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch {
      return null;
    }
  }
}
