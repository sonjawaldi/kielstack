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
});
