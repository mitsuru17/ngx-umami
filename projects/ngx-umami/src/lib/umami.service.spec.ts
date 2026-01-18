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

      expect(consoleSpy).not.toHaveBeenCalled();
      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeTruthy();
    });

    it('should load script with localhost HTTP URL', () => {
      const consoleSpy = spyOn(console, 'error');
      service = createService({ src: 'http://localhost:3000/script.js' });

      expect(consoleSpy).not.toHaveBeenCalled();
      const script = document.querySelector('script[data-website-id="test-website-id"]');
      expect(script).toBeTruthy();
    });

    it('should load script with 127.0.0.1 HTTP URL', () => {
      const consoleSpy = spyOn(console, 'error');
      service = createService({ src: 'http://127.0.0.1:3000/script.js' });

      expect(consoleSpy).not.toHaveBeenCalled();
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

    it('should allow subdomain.localhost HTTP URLs', () => {
      const consoleSpy = spyOn(console, 'error');
      service = createService({ src: 'http://app.localhost:3000/script.js' });

      expect(consoleSpy).not.toHaveBeenCalled();
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
    it('should return false when tracker is not available', () => {
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
    it('should call disable on destroy', () => {
      service = createService({ src: 'https://analytics.example.com/script.js' });
      const disableSpy = spyOn(service, 'disable');

      service.ngOnDestroy();

      expect(disableSpy).toHaveBeenCalled();
    });
  });
});
