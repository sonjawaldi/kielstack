import { DOCUMENT } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly menuOpen = signal(false);
  readonly darkMode = signal(true);

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.document.documentElement.classList.add('dark');
  }

  toggleTheme(): void {
    this.darkMode.update((value) => !value);
    this.document.documentElement.classList.toggle('dark', this.darkMode());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
