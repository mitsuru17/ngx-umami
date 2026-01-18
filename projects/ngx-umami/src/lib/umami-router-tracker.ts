import {
  EnvironmentProviders,
  Injectable,
  inject,
  makeEnvironmentProviders,
  DestroyRef,
  APP_INITIALIZER,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UmamiService } from './umami.service';

/**
 * Service that automatically tracks route changes
 * This is an internal service used by withRouterTracking()
 */
@Injectable()
export class UmamiRouterTracker {
  private readonly router = inject(Router);
  private readonly umami = inject(UmamiService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Initialize route tracking
   */
  init(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.umami.trackPageView({
          url: event.urlAfterRedirects,
        });
      });
  }
}

/**
 * Factory function to initialize router tracking
 */
function initializeRouterTracking(tracker: UmamiRouterTracker): () => void {
  return () => tracker.init();
}

/**
 * Enable automatic page view tracking on route changes
 *
 * Use this with provideUmami() when you want to track SPA navigation
 *
 * @returns Environment providers for router tracking
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { ApplicationConfig } from '@angular/core';
 * import { provideRouter } from '@angular/router';
 * import { provideUmami, withRouterTracking } from 'ngx-umami';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideRouter(routes),
 *     provideUmami({
 *       websiteId: 'your-website-id',
 *       src: 'https://analytics.example.com/script.js',
 *       autoTrack: false // Disable auto tracking since router handles it
 *     }),
 *     withRouterTracking()
 *   ]
 * };
 * ```
 */
export function withRouterTracking(): EnvironmentProviders {
  return makeEnvironmentProviders([
    UmamiRouterTracker,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeRouterTracking,
      deps: [UmamiRouterTracker],
      multi: true,
    },
  ]);
}
