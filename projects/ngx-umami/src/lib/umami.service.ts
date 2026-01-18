import { Injectable, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UMAMI_CONFIG } from './umami.token';
import {
  UmamiEventData,
  UmamiPageViewPayload,
  UmamiIdentifyData,
  UmamiTracker,
} from './umami.types';

/**
 * Service for interacting with Umami Analytics
 *
 * @example
 * ```typescript
 * // In a component
 * export class MyComponent {
 *   private umami = inject(UmamiService);
 *
 *   onButtonClick() {
 *     this.umami.trackEvent('button_click', { button: 'signup' });
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class UmamiService implements OnDestroy {
  private readonly config = inject(UMAMI_CONFIG);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private scriptElement: HTMLScriptElement | null = null;
  private initialized = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize Umami tracker script
   */
  private init(): void {
    if (!this.isBrowser || this.initialized) {
      return;
    }

    if (this.config.enabled === false) {
      console.debug('[ngx-umami] Tracking is disabled');
      return;
    }

    // Check Do Not Track setting
    if (this.config.doNotTrack && navigator.doNotTrack === '1') {
      console.debug('[ngx-umami] Do Not Track is enabled, tracking disabled');
      return;
    }

    // Check domain restrictions
    if (this.config.domains?.length) {
      const currentDomain = window.location.hostname;
      if (!this.config.domains.includes(currentDomain)) {
        console.debug(`[ngx-umami] Current domain "${currentDomain}" not in allowed domains`);
        return;
      }
    }

    this.loadScript();
    this.initialized = true;
  }

  /**
   * Validate the script URL
   * @param src The script URL to validate
   * @returns true if valid, false otherwise
   */
  private isValidScriptUrl(src: string): boolean {
    try {
      const url = new URL(src);

      // Allow HTTPS always
      if (url.protocol === 'https:') {
        return true;
      }

      // Allow HTTP only for localhost/127.0.0.1 (development)
      if (url.protocol === 'http:') {
        const isLocalhost =
          url.hostname === 'localhost' ||
          url.hostname === '127.0.0.1' ||
          url.hostname.endsWith('.localhost');
        if (isLocalhost) {
          return true;
        }
        console.warn(
          '[ngx-umami] HTTP URLs are only allowed for localhost. Use HTTPS for production.'
        );
        return false;
      }

      console.warn(`[ngx-umami] Invalid protocol "${url.protocol}". Only HTTPS is allowed.`);
      return false;
    } catch {
      console.error(`[ngx-umami] Invalid script URL: "${src}"`);
      return false;
    }
  }

  /**
   * Load the Umami tracker script
   */
  private loadScript(): void {
    if (!this.isValidScriptUrl(this.config.src)) {
      console.error('[ngx-umami] Script loading aborted due to invalid URL');
      return;
    }

    this.scriptElement = document.createElement('script');
    this.scriptElement.async = true;
    this.scriptElement.defer = true;
    this.scriptElement.src = this.config.src;
    this.scriptElement.dataset['websiteId'] = this.config.websiteId;

    // Apply configuration options as data attributes
    if (this.config.autoTrack === false) {
      this.scriptElement.dataset['autoTrack'] = 'false';
    }

    if (this.config.doNotTrack) {
      this.scriptElement.dataset['doNotTrack'] = 'true';
    }

    if (this.config.domains?.length) {
      this.scriptElement.dataset['domains'] = this.config.domains.join(',');
    }

    if (this.config.tag) {
      this.scriptElement.dataset['tag'] = this.config.tag;
    }

    if (this.config.excludeSearch) {
      this.scriptElement.dataset['excludeSearch'] = 'true';
    }

    if (this.config.excludeHash) {
      this.scriptElement.dataset['excludeHash'] = 'true';
    }

    if (this.config.hostUrl) {
      this.scriptElement.dataset['hostUrl'] = this.config.hostUrl;
    }

    document.head.appendChild(this.scriptElement);
  }

  /**
   * Get the Umami tracker instance
   */
  private getTracker(): UmamiTracker | undefined {
    if (!this.isBrowser) {
      return undefined;
    }
    return window.umami;
  }

  /**
   * Check if tracking is available
   */
  isAvailable(): boolean {
    return this.isBrowser && this.initialized && !!this.getTracker();
  }

  /**
   * Track a page view
   *
   * @param payload Optional page view data (url, title, referrer)
   *
   * @example
   * ```typescript
   * // Track current page
   * umami.trackPageView();
   *
   * // Track with custom URL
   * umami.trackPageView({ url: '/custom-page', title: 'Custom Page' });
   * ```
   */
  trackPageView(payload?: UmamiPageViewPayload): void {
    const tracker = this.getTracker();
    if (!tracker) {
      return;
    }

    if (payload) {
      tracker.track(payload);
    } else {
      tracker.track();
    }
  }

  /**
   * Track a custom event
   *
   * @param eventName Name of the event
   * @param eventData Optional event data (max 50 properties)
   *
   * @example
   * ```typescript
   * // Simple event
   * umami.trackEvent('signup_click');
   *
   * // Event with data
   * umami.trackEvent('purchase', {
   *   product: 'Premium Plan',
   *   price: 99.99,
   *   currency: 'USD'
   * });
   * ```
   */
  trackEvent(eventName: string, eventData?: UmamiEventData): void {
    const tracker = this.getTracker();
    if (!tracker) {
      return;
    }

    if (eventData) {
      tracker.track(eventName, eventData);
    } else {
      tracker.track(eventName);
    }
  }

  /**
   * Identify a user session
   *
   * @param sessionIdOrData Session ID string or session data object
   * @param sessionData Optional session data when first param is ID
   *
   * @example
   * ```typescript
   * // Identify with ID only
   * umami.identify('user-123');
   *
   * // Identify with ID and data
   * umami.identify('user-123', { plan: 'premium', role: 'admin' });
   *
   * // Identify with data only
   * umami.identify({ plan: 'premium', role: 'admin' });
   * ```
   */
  identify(sessionIdOrData: string | UmamiIdentifyData, sessionData?: UmamiIdentifyData): void {
    const tracker = this.getTracker();
    if (!tracker) {
      return;
    }

    if (typeof sessionIdOrData === 'string') {
      if (sessionData) {
        tracker.identify(sessionIdOrData, sessionData);
      } else {
        tracker.identify(sessionIdOrData);
      }
    } else {
      tracker.identify(sessionIdOrData);
    }
  }

  /**
   * Disable tracking programmatically
   * Useful for development or when user opts out
   */
  disable(): void {
    if (this.scriptElement && this.isBrowser) {
      this.scriptElement.remove();
      this.scriptElement = null;
      this.initialized = false;
    }
  }

  ngOnDestroy(): void {
    this.disable();
  }
}
