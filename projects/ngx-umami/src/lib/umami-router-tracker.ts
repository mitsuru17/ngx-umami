import {
  EnvironmentProviders,
  Injectable,
  inject,
  makeEnvironmentProviders,
  DestroyRef,
  provideAppInitializer,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UmamiService } from './umami.service';
import { UMAMI_CONFIG } from './umami.token';

/**
 * Service that automatically tracks route changes
 * This is an internal service used by withRouterTracking()
 */
@Injectable()
export class UmamiRouterTracker {
  private readonly router = inject(Router);
  private readonly umami = inject(UmamiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly config = inject(UMAMI_CONFIG, { optional: true });

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
          url: this.normalizeUrl(event.urlAfterRedirects),
        });
      });
  }

  /**
   * Apply `excludeSearch` / `excludeHash`. The tracker only normalizes URLs it
   * reads from `history`, not the ones passed explicitly to `track()`.
   */
  private normalizeUrl(url: string): string {
    let result = url;
    if (this.config?.excludeHash) {
      const hashIndex = result.indexOf('#');
      if (hashIndex !== -1) result = result.slice(0, hashIndex);
    }
    if (this.config?.excludeSearch) {
      const searchIndex = result.indexOf('?');
      if (searchIndex !== -1) {
        const hashIndex = result.indexOf('#', searchIndex);
        result = result.slice(0, searchIndex) + (hashIndex !== -1 ? result.slice(hashIndex) : '');
      }
    }
    return result;
  }
}

/**
 * Enable automatic page view tracking on route changes
 *
 * Use this with provideUmami() when you want to track SPA navigation.
 *
 * Umami already tracks `history.pushState` navigations on its own, so set
 * `autoPageview: false` (Umami v3.2+) to avoid counting each navigation twice.
 * Avoid `autoTrack: false` here: in Umami v3 it disables the whole tracker,
 * including `data-umami-event` and referrer updates between routes.
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
 *       autoPageview: false // The router sends the page views (Umami v3.2+)
 *     }),
 *     withRouterTracking()
 *   ]
 * };
 * ```
 */
export function withRouterTracking(): EnvironmentProviders {
  return makeEnvironmentProviders([
    UmamiRouterTracker,
    provideAppInitializer(() => inject(UmamiRouterTracker).init()),
  ]);
}
