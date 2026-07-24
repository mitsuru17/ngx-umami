import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import { UmamiService } from './umami.service';
import { UmamiEventData } from './umami.types';

/**
 * Directive for tracking click events on elements
 *
 * @example
 * ```html
 * <!-- Simple event tracking -->
 * <button umamiTrack="signup_click">Sign Up</button>
 *
 * <!-- With event data -->
 * <button
 *   umamiTrack="purchase"
 *   [umamiTrackData]="{ product: 'Premium', price: 99 }">
 *   Buy Now
 * </button>
 *
 * <!-- On different events -->
 * <input
 *   umamiTrack="search_focus"
 *   umamiTrackOn="focus"
 *   placeholder="Search...">
 * ```
 */
@Directive({
  selector: '[umamiTrack]',
  standalone: true,
})
export class UmamiTrackDirective {
  private readonly umami = inject(UmamiService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  /**
   * Event name to track
   */
  readonly umamiTrack = input.required<string>();

  /**
   * Optional event data
   */
  readonly umamiTrackData = input<UmamiEventData>();

  /**
   * DOM event to listen for (default: 'click')
   */
  readonly umamiTrackOn = input<
    'click' | 'focus' | 'blur' | 'mouseenter' | 'mouseleave' | 'submit'
  >('click');

  constructor() {
    // Single listener bound to the configured event; re-registered if
    // umamiTrackOn changes and removed on destroy via effect cleanup
    effect((onCleanup) => {
      const unlisten = this.renderer.listen(
        this.elementRef.nativeElement,
        this.umamiTrackOn(),
        () => this.umami.trackEvent(this.umamiTrack(), this.umamiTrackData())
      );
      onCleanup(unlisten);
    });
  }
}
