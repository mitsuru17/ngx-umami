import { inject } from '@angular/core';
import { UmamiService } from './umami.service';

/**
 * Convenience function to inject UmamiService
 *
 * @returns UmamiService instance
 *
 * @example
 * ```typescript
 * import { injectUmami } from 'ngx-umami';
 *
 * @Component({...})
 * export class MyComponent {
 *   private umami = injectUmami();
 *
 *   trackPurchase() {
 *     this.umami.trackEvent('purchase', { amount: 99.99 });
 *   }
 * }
 * ```
 */
export function injectUmami(): UmamiService {
  return inject(UmamiService);
}
