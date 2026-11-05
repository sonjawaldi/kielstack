import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WorkspaceCardComponent } from './workspace-card.component';

describe('WorkspaceCardComponent', () => {
  function create(reducedMotion: boolean) {
    spyOn(window, 'matchMedia').and.returnValue({ matches: reducedMotion } as MediaQueryList);
    const fixture = TestBed.createComponent(WorkspaceCardComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('wechselt von selbst durch die Schritte und beginnt wieder vorn', fakeAsync(() => {
    const fixture = create(false);

    tick(4000);
    expect(fixture.componentInstance.step()).toBe(1);

    tick(8000);
    expect(fixture.componentInstance.step()).toBe(0);

    fixture.destroy();
  }));

  it('haelt an, sobald jemand einen Schritt anklickt', fakeAsync(() => {
    const fixture = create(false);

    fixture.nativeElement.querySelectorAll('.ws-steps button')[2].click();
    tick(8000);

    expect(fixture.componentInstance.step()).toBe(2);

    fixture.destroy();
  }));

  it('bewegt sich bei reduzierter Bewegung nicht von selbst', fakeAsync(() => {
    const fixture = create(true);

    tick(8000);

    expect(fixture.componentInstance.step()).toBe(0);
  }));

  it('laesst sich ueber den Knopf anhalten und wieder starten', fakeAsync(() => {
    const fixture = create(false);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.ws-toggle');
    expect(button.getAttribute('aria-label')).toContain('anhalten');

    button.click();
    fixture.detectChanges();
    tick(8000);
    expect(fixture.componentInstance.step()).toBe(0);
    expect(button.getAttribute('aria-label')).toContain('starten');

    button.click();
    tick(4000);
    expect(fixture.componentInstance.step()).toBe(1);

    fixture.destroy();
  }));

  it('wechselt nicht, solange Maus oder Fokus auf der Karte liegen', fakeAsync(() => {
    const fixture = create(false);
    const panel: HTMLElement = fixture.nativeElement.querySelector('.panel');

    panel.dispatchEvent(new FocusEvent('focusin'));
    tick(8000);
    expect(fixture.componentInstance.step()).toBe(0);

    panel.dispatchEvent(new FocusEvent('focusout'));
    tick(4000);
    expect(fixture.componentInstance.step()).toBe(1);

    fixture.destroy();
  }));

  it('sagt nur selbst gewaehlte Schritte an, nicht den automatischen Wechsel', fakeAsync(() => {
    const fixture = create(false);
    const preview: HTMLElement = fixture.nativeElement.querySelector('.ws-preview');
    expect(preview.getAttribute('aria-live')).toBe('off');

    fixture.nativeElement.querySelectorAll('.ws-steps button')[1].click();
    fixture.detectChanges();

    expect(preview.getAttribute('aria-live')).toBe('polite');

    fixture.destroy();
  }));
});
