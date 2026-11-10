import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

/**
 * Rechtliche Seiten erreicht man meist ueber den Footer. Der Router laesst die
 * Scrollposition stehen (die Startseite scrollt selbst zu ihren Abschnitten),
 * darum starten diese Seiten ausdruecklich oben.
 */
export function scrollToTop(): void {
  inject(DOCUMENT).defaultView?.scrollTo({ top: 0, behavior: 'instant' });
}
