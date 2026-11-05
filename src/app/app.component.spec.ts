import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent Farbschema', () => {
  const KEY = 'kielstack-theme';
  let systemDark: boolean;
  let systemListener: ((event: { matches: boolean }) => void) | undefined;

  beforeEach(() => {
    localStorage.removeItem(KEY);
    systemDark = false;
    systemListener = undefined;

    spyOn(window, 'matchMedia').and.callFake(
      () =>
        ({
          matches: systemDark,
          addEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
            (systemListener = listener),
        }) as unknown as MediaQueryList,
    );

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => {
    localStorage.removeItem(KEY);
    document.documentElement.classList.remove('dark');
  });

  function create(): AppComponent {
    return TestBed.createComponent(AppComponent).componentInstance;
  }

  it('folgt ohne eigene Wahl dem System', () => {
    systemDark = true;

    expect(create().darkMode()).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
  });

  it('folgt auch einem spaeteren Wechsel im System', () => {
    const app = create();

    systemListener!({ matches: true });

    expect(app.darkMode()).toBeTrue();
  });

  it('merkt sich die eigene Wahl und laesst sich vom System nicht mehr umstellen', () => {
    const app = create();

    app.toggleTheme();
    systemListener!({ matches: false });

    expect(localStorage.getItem(KEY)).toBe('dark');
    expect(app.darkMode()).toBeTrue();
  });

  it('zieht die gespeicherte Wahl dem System vor', () => {
    localStorage.setItem(KEY, 'light');
    systemDark = true;

    expect(create().darkMode()).toBeFalse();
  });
});
