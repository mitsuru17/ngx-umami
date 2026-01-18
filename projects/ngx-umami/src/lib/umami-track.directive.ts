import { Directive, HostListener, Input, inject } from '@angular/core';
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

  /**
   * Event name to track
   */
  @Input({ required: true }) umamiTrack!: string;

  /**
   * Optional event data
   */
  @Input() umamiTrackData?: UmamiEventData;

  /**
   * DOM event to listen for (default: 'click')
   */
  @Input() umamiTrackOn: 'click' | 'focus' | 'blur' | 'mouseenter' | 'mouseleave' | 'submit' =
    'click';

  @HostListener('click')
  onClick(): void {
    if (this.umamiTrackOn === 'click') {
      this.track();
    }
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.umamiTrackOn === 'focus') {
      this.track();
    }
  }

  @HostListener('blur')
  onBlur(): void {
    if (this.umamiTrackOn === 'blur') {
      this.track();
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.umamiTrackOn === 'mouseenter') {
      this.track();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.umamiTrackOn === 'mouseleave') {
      this.track();
    }
  }

  @HostListener('submit')
  onSubmit(): void {
    if (this.umamiTrackOn === 'submit') {
      this.track();
    }
  }

  private track(): void {
    this.umami.trackEvent(this.umamiTrack, this.umamiTrackData);
  }
}
