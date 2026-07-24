import { TestBed } from '@angular/core/testing';

import { UmamiService } from './umami.service';
import { UMAMI_CONFIG } from './umami.token';
import { UmamiConfig } from './umami.types';

describe('UmamiService', () => {
  let service: UmamiService;

  function createService(config: Partial<UmamiConfig>) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UmamiService,
        {
          provide: UMAMI_CONFIG,
          useValue: {
            websiteId: 'test-website-id',
            src: 'https://analytics.example.com/script.js',
            ...config,
          },
        },
      ],
    });
    return TestBed.inject(UmamiService);
  }

  beforeEach(() => {
    // Clean up any previously appended scripts
    document.querySelectorAll('script[data-website-id]').forEach((el) => el.remove());
  });

  afterEach(() => {
    // Clean up scripts after each test
    document.querySelectorAll('script[data-website-id]').forEach((el) => el.remove());
  });

  it('should be created', () => {
    service = createService({});
    expect(service).toBeTruthy();
  });

  describe('URL validation', () => {
    it('should load script with valid HTTPS URL', () => {
      const consoleSpy = spyOn(console, 'error');
      service = createService({ src: 'https://analytics.example.com/script.js' });

      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeTruthy();
      // Only URL validation errors should not have been called (onerror from failed network load is expected in tests)
      expect(consoleSpy).not.toHaveBeenCalledWith(
        '[ngx-umami] Script loading aborted due to invalid URL'
      );
    });

    it('should load script with localhost HTTP URL', () => {
      service = createService({ src: 'http://localhost:3000/script.js' });

      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeTruthy();
    });

    it('should load script with 127.0.0.1 HTTP URL', () => {
      service = createService({ src: 'http://127.0.0.1:3000/script.js' });

      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeTruthy();
    });

    it('should reject HTTP URL for non-localhost domains', () => {
      const consoleWarnSpy = spyOn(console, 'warn');
      const consoleErrorSpy = spyOn(console, 'error');
      service = createService({ src: 'http://analytics.example.com/script.js' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[ngx-umami] HTTP URLs are only allowed for localhost. Use HTTPS for production.'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ngx-umami] Script loading aborted due to invalid URL'
      );
      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();
    });

    it('should reject invalid URL format', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      service = createService({ src: 'not-a-valid-url' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ngx-umami] Invalid script URL: "not-a-valid-url"'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ngx-umami] Script loading aborted due to invalid URL'
      );
      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();
    });

    it('should reject javascript: protocol URLs', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      service = createService({ src: 'javascript:alert(1)' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();
    });

    it('should reject data: protocol URLs', () => {
      const consoleWarnSpy = spyOn(console, 'warn');
      const consoleErrorSpy = spyOn(console, 'error');
      service = createService({ src: 'data:text/javascript,alert(1)' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[ngx-umami] Invalid protocol "data:". Only HTTPS is allowed.'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ngx-umami] Script loading aborted due to invalid URL'
      );
      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();
    });

    it('should not enqueue events when script URL is invalid', () => {
      spyOn(console, 'error');
      service = createService({ src: 'not-a-valid-url' });

      service.trackEvent('event_after_invalid_url');
      service.trackPageView();
      service.identify('user-123');

      const queue = (service as unknown as { eventQueue: unknown[] }).eventQueue;
      expect(queue.length).toBe(0);
    });

    it('should allow subdomain.localhost HTTP URLs', () => {
      service = createService({ src: 'http://app.localhost:3000/script.js' });

      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeTruthy();
    });
  });

  describe('disabled tracking', () => {
    it('should not load script when enabled is false', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        enabled: false,
      });

      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();
    });
  });

  describe('doNotTrack', () => {
    it('should not load script when doNotTrack is enabled and browser DNT is 1', () => {
      const originalDoNotTrack = navigator.doNotTrack;
      Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });

      const consoleDebugSpy = spyOn(console, 'debug');
      service = createService({
        src: 'https://analytics.example.com/script.js',
        doNotTrack: true,
      });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[ngx-umami] Do Not Track is enabled, tracking disabled'
      );
      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();

      Object.defineProperty(navigator, 'doNotTrack', {
        value: originalDoNotTrack,
        configurable: true,
      });
    });
  });

  describe('doNotTrack with "yes" value', () => {
    it('should not load script when browser reports DNT as "yes"', () => {
      const originalDoNotTrack = navigator.doNotTrack;
      Object.defineProperty(navigator, 'doNotTrack', { value: 'yes', configurable: true });

      const consoleDebugSpy = spyOn(console, 'debug');
      service = createService({
        src: 'https://analytics.example.com/script.js',
        doNotTrack: true,
      });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[ngx-umami] Do Not Track is enabled, tracking disabled'
      );
      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();

      Object.defineProperty(navigator, 'doNotTrack', {
        value: originalDoNotTrack,
        configurable: true,
      });
    });
  });

  describe('duplicate script guard', () => {
    function appendExistingScript(): HTMLScriptElement {
      const existing = document.createElement('script');
      existing.dataset['websiteId'] = 'test-website-id';
      document.head.appendChild(existing);
      return existing;
    }

    it('should not inject a second script when one already exists for the website id', () => {
      appendExistingScript();

      service = createService({ src: 'https://analytics.example.com/script.js' });

      const scripts = document.querySelectorAll('script[data-website-id="test-website-id"]');
      expect(scripts.length).toBe(1);
    });

    it('should flush queued events immediately when tracker already exists', () => {
      const mockTracker = {
        track: jasmine.createSpy('track'),
        identify: jasmine.createSpy('identify'),
      };
      appendExistingScript();
      (window as { umami?: unknown }).umami = mockTracker;

      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.trackEvent('reused_script_event');

      expect(mockTracker.track).toHaveBeenCalledWith('reused_script_event');
      delete (window as { umami?: unknown }).umami;
    });

    it('should wait for the existing script to load before flushing', () => {
      const mockTracker = {
        track: jasmine.createSpy('track'),
        identify: jasmine.createSpy('identify'),
      };
      const existing = appendExistingScript();

      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.trackEvent('queued_on_existing');
      expect(mockTracker.track).not.toHaveBeenCalled();

      (window as { umami?: unknown }).umami = mockTracker;
      existing.dispatchEvent(new Event('load'));

      expect(mockTracker.track).toHaveBeenCalledWith('queued_on_existing');
      delete (window as { umami?: unknown }).umami;
    });
  });

  describe('onScriptError callback', () => {
    it('should invoke onScriptError with the script src when loading fails', () => {
      spyOn(console, 'error');
      const onScriptError = jasmine.createSpy('onScriptError');
      service = createService({
        src: 'https://analytics.example.com/script.js',
        onScriptError,
      });

      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onerror?.(new Event('error'));

      expect(onScriptError).toHaveBeenCalledWith('https://analytics.example.com/script.js');
    });
  });

  describe('domain restrictions', () => {
    it('should not load script when current domain is not in allowed domains', () => {
      const consoleDebugSpy = spyOn(console, 'debug');
      service = createService({
        src: 'https://analytics.example.com/script.js',
        domains: ['other-domain.com'],
      });

      expect(consoleDebugSpy).toHaveBeenCalled();
      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();
    });

    it('should load script when current domain is in allowed domains', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        domains: ['localhost'],
      });

      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeTruthy();
    });
  });

  describe('script data attributes', () => {
    it('should set autoTrack to false when configured', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        autoTrack: false,
      });

      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      expect(script?.dataset['autoTrack']).toBe('false');
    });

    it('should set doNotTrack attribute when configured', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        doNotTrack: true,
        domains: ['localhost'],
      });

      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      expect(script?.dataset['doNotTrack']).toBe('true');
    });

    it('should set domains attribute when configured', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        domains: ['localhost', 'example.com'],
      });

      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      expect(script?.dataset['domains']).toBe('localhost,example.com');
    });

    it('should set tag attribute when configured', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        tag: 'production',
      });

      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      expect(script?.dataset['tag']).toBe('production');
    });

    it('should set excludeSearch attribute when configured', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        excludeSearch: true,
      });

      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      expect(script?.dataset['excludeSearch']).toBe('true');
    });

    it('should set excludeHash attribute when configured', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        excludeHash: true,
      });

      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      expect(script?.dataset['excludeHash']).toBe('true');
    });

    it('should set hostUrl attribute when configured', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        hostUrl: 'https://proxy.example.com',
      });

      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      expect(script?.dataset['hostUrl']).toBe('https://proxy.example.com');
    });
  });

  describe('isAvailable', () => {
    it('should return false when script has not loaded yet', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      expect(service.isAvailable()).toBeFalse();
    });

    it('should return false when service is disabled', () => {
      service = createService({
        src: 'https://analytics.example.com/script.js',
        enabled: false,
      });
      expect(service.isAvailable()).toBeFalse();
    });

    it('should return true when script loaded and tracker is available', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      (window as { umami?: unknown }).umami = {
        track: jasmine.createSpy(),
        identify: jasmine.createSpy(),
      };
      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onload?.(new Event('load'));
      expect(service.isAvailable()).toBeTrue();
      delete (window as { umami?: unknown }).umami;
    });
  });

  describe('tracking methods without tracker', () => {
    beforeEach(() => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
    });

    it('should not throw when trackPageView is called without tracker', () => {
      expect(() => service.trackPageView()).not.toThrow();
    });

    it('should not throw when trackPageView is called with payload', () => {
      expect(() => service.trackPageView({ url: '/test' })).not.toThrow();
    });

    it('should not throw when trackEvent is called without tracker', () => {
      expect(() => service.trackEvent('test_event')).not.toThrow();
    });

    it('should not throw when trackEvent is called with data', () => {
      expect(() => service.trackEvent('test_event', { key: 'value' })).not.toThrow();
    });

    it('should not throw when identify is called with string', () => {
      expect(() => service.identify('user-123')).not.toThrow();
    });

    it('should not throw when identify is called with string and data', () => {
      expect(() => service.identify('user-123', { plan: 'premium' })).not.toThrow();
    });

    it('should not throw when identify is called with data only', () => {
      expect(() => service.identify({ plan: 'premium' })).not.toThrow();
    });
  });

  describe('event queue', () => {
    let mockTracker: { track: jasmine.Spy; identify: jasmine.Spy };

    beforeEach(() => {
      mockTracker = {
        track: jasmine.createSpy('track'),
        identify: jasmine.createSpy('identify'),
      };
    });

    afterEach(() => {
      delete (window as { umami?: unknown }).umami;
    });

    it('should queue trackEvent calls made before script loads and flush on load', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.trackEvent('queued_event', { key: 'value' });
      expect(mockTracker.track).not.toHaveBeenCalled();

      (window as { umami?: unknown }).umami = mockTracker;
      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onload?.(new Event('load'));

      expect(mockTracker.track).toHaveBeenCalledWith('queued_event', { key: 'value' });
    });

    it('should queue trackPageView calls made before script loads and flush on load', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.trackPageView({ url: '/queued-page' });
      expect(mockTracker.track).not.toHaveBeenCalled();

      (window as { umami?: unknown }).umami = mockTracker;
      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onload?.(new Event('load'));

      expect(mockTracker.track).toHaveBeenCalledWith({ url: '/queued-page' });
    });

    it('should queue identify calls made before script loads and flush on load', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.identify('user-123', { plan: 'premium' });
      expect(mockTracker.identify).not.toHaveBeenCalled();

      (window as { umami?: unknown }).umami = mockTracker;
      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onload?.(new Event('load'));

      expect(mockTracker.identify).toHaveBeenCalledWith('user-123', { plan: 'premium' });
    });

    it('should flush multiple queued events in order', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.trackEvent('first');
      service.trackEvent('second');
      service.trackEvent('third');

      (window as { umami?: unknown }).umami = mockTracker;
      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onload?.(new Event('load'));

      expect(mockTracker.track.calls.count()).toBe(3);
      expect(mockTracker.track.calls.argsFor(0)).toEqual(['first']);
      expect(mockTracker.track.calls.argsFor(1)).toEqual(['second']);
      expect(mockTracker.track.calls.argsFor(2)).toEqual(['third']);
    });

    it('should run trackEvent immediately after script has loaded', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      (window as { umami?: unknown }).umami = mockTracker;
      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onload?.(new Event('load'));

      service.trackEvent('immediate_event');
      expect(mockTracker.track).toHaveBeenCalledWith('immediate_event');
    });

    it('should log error when script fails to load', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      service = createService({ src: 'https://analytics.example.com/script.js' });
      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onerror?.(new Event('error'));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ngx-umami] Failed to load script from:',
        'https://analytics.example.com/script.js'
      );
    });

    it('should discard queued events when script fails to load', () => {
      spyOn(console, 'error');
      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.trackEvent('queued_before_failure');

      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onerror?.(new Event('error'));

      // Even if a tracker becomes available later, the discarded queue must not flush.
      (window as { umami?: unknown }).umami = mockTracker;
      script.onload?.(new Event('load'));

      expect(mockTracker.track).not.toHaveBeenCalled();
    });

    it('should not enqueue or run new events after script has failed to load', () => {
      spyOn(console, 'error');
      service = createService({ src: 'https://analytics.example.com/script.js' });
      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onerror?.(new Event('error'));

      service.trackEvent('after_failure');
      service.trackPageView();
      service.identify('user-123');

      (window as { umami?: unknown }).umami = mockTracker;
      script.onload?.(new Event('load'));

      expect(mockTracker.track).not.toHaveBeenCalled();
      expect(mockTracker.identify).not.toHaveBeenCalled();
    });
  });

  describe('tracking methods with mock tracker', () => {
    let mockTracker: {
      track: jasmine.Spy;
      identify: jasmine.Spy;
    };

    beforeEach(() => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      mockTracker = {
        track: jasmine.createSpy('track'),
        identify: jasmine.createSpy('identify'),
      };
      (window as { umami?: unknown }).umami = mockTracker;
      // Simulate script loaded so calls execute immediately
      const script = document.querySelector(
        'script[data-website-id="test-website-id"]'
      ) as HTMLScriptElement;
      script.onload?.(new Event('load'));
    });

    afterEach(() => {
      delete (window as { umami?: unknown }).umami;
    });

    it('should call tracker.track() for trackPageView without payload', () => {
      service.trackPageView();
      expect(mockTracker.track).toHaveBeenCalledWith();
    });

    it('should call tracker.track(payload) for trackPageView with payload', () => {
      service.trackPageView({ url: '/test', title: 'Test' });
      expect(mockTracker.track).toHaveBeenCalledWith({ url: '/test', title: 'Test' });
    });

    it('should call tracker.track(eventName) for trackEvent without data', () => {
      service.trackEvent('click_button');
      expect(mockTracker.track).toHaveBeenCalledWith('click_button');
    });

    it('should call tracker.track(eventName, data) for trackEvent with data', () => {
      service.trackEvent('purchase', { amount: 99.99 });
      expect(mockTracker.track).toHaveBeenCalledWith('purchase', { amount: 99.99 });
    });

    it('should call tracker.identify(id) for identify with string only', () => {
      service.identify('user-123');
      expect(mockTracker.identify).toHaveBeenCalledWith('user-123');
    });

    it('should call tracker.identify(id, data) for identify with string and data', () => {
      service.identify('user-123', { plan: 'premium' });
      expect(mockTracker.identify).toHaveBeenCalledWith('user-123', { plan: 'premium' });
    });

    it('should call tracker.identify(data) for identify with object only', () => {
      service.identify({ plan: 'premium' });
      expect(mockTracker.identify).toHaveBeenCalledWith({ plan: 'premium' });
    });
  });

  describe('disable', () => {
    afterEach(() => {
      localStorage.removeItem('umami.disabled');
    });

    it('should set the umami.disabled flag in localStorage', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.disable();
      expect(localStorage.getItem('umami.disabled')).toBe('1');
    });

    it('should clear the event queue when disabled', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.trackEvent('queued_event');

      service.disable();

      const queue = (service as unknown as { eventQueue: unknown[] }).eventQueue;
      expect(queue.length).toBe(0);
    });

    it('should remove script element when disabled', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      let script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeTruthy();

      service.disable();

      script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();
    });

    it('should set initialized to false after disable', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      service.disable();
      expect(service.isAvailable()).toBeFalse();
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove script element on destroy', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });

      service.ngOnDestroy();

      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeFalsy();
    });

    it('should not persist the umami.disabled flag on destroy', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });

      service.ngOnDestroy();

      expect(localStorage.getItem('umami.disabled')).toBeNull();
    });
  });
});
