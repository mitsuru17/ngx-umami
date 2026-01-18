import { TestBed } from '@angular/core/testing';
import { provideUmami, provideUmamiWithFactory } from './provide-umami';
import { UMAMI_CONFIG } from './umami.token';
import { UmamiService } from './umami.service';
import { UmamiConfig } from './umami.types';
import { Injectable } from '@angular/core';

@Injectable()
class MockConfigService {
  websiteId = 'factory-website-id';
  src = 'https://factory.example.com/script.js';
  isProduction = true;
}

describe('provideUmami', () => {
  beforeEach(() => {
    document.querySelectorAll('script[data-website-id]').forEach((el) => el.remove());
  });

  afterEach(() => {
    document.querySelectorAll('script[data-website-id]').forEach((el) => el.remove());
  });

  it('should provide UMAMI_CONFIG token with the given config', () => {
    const config: UmamiConfig = {
      websiteId: 'test-id',
      src: 'https://analytics.example.com/script.js',
    };

    TestBed.configureTestingModule({
      providers: [provideUmami(config)],
    });

    const providedConfig = TestBed.inject(UMAMI_CONFIG);
    expect(providedConfig).toEqual(config);
  });

  it('should provide UmamiService', () => {
    const config: UmamiConfig = {
      websiteId: 'test-id',
      src: 'https://analytics.example.com/script.js',
    };

    TestBed.configureTestingModule({
      providers: [provideUmami(config)],
    });

    const service = TestBed.inject(UmamiService);
    expect(service).toBeTruthy();
    expect(service instanceof UmamiService).toBeTrue();
  });

  it('should provide config with all optional properties', () => {
    const config: UmamiConfig = {
      websiteId: 'test-id',
      src: 'https://analytics.example.com/script.js',
      enabled: false,
      autoTrack: false,
      doNotTrack: true,
      domains: ['example.com', 'www.example.com'],
      tag: 'production',
      excludeSearch: true,
      excludeHash: true,
      hostUrl: 'https://proxy.example.com',
    };

    TestBed.configureTestingModule({
      providers: [provideUmami(config)],
    });

    const providedConfig = TestBed.inject(UMAMI_CONFIG);
    expect(providedConfig).toEqual(config);
  });
});

describe('provideUmamiWithFactory', () => {
  beforeEach(() => {
    document.querySelectorAll('script[data-website-id]').forEach((el) => el.remove());
  });

  afterEach(() => {
    document.querySelectorAll('script[data-website-id]').forEach((el) => el.remove());
  });

  it('should use factory function to create config', () => {
    TestBed.configureTestingModule({
      providers: [
        MockConfigService,
        provideUmamiWithFactory(
          (configService) => {
            const cfg = configService as MockConfigService;
            return {
              websiteId: cfg.websiteId,
              src: cfg.src,
              enabled: cfg.isProduction,
            };
          },
          [MockConfigService]
        ),
      ],
    });

    const providedConfig = TestBed.inject(UMAMI_CONFIG);
    expect(providedConfig.websiteId).toBe('factory-website-id');
    expect(providedConfig.src).toBe('https://factory.example.com/script.js');
    expect(providedConfig.enabled).toBeTrue();
  });

  it('should work with factory function without dependencies', () => {
    TestBed.configureTestingModule({
      providers: [
        provideUmamiWithFactory(() => ({
          websiteId: 'no-deps-id',
          src: 'https://no-deps.example.com/script.js',
        })),
      ],
    });

    const providedConfig = TestBed.inject(UMAMI_CONFIG);
    expect(providedConfig.websiteId).toBe('no-deps-id');
  });

  it('should provide UmamiService when using factory', () => {
    TestBed.configureTestingModule({
      providers: [
        provideUmamiWithFactory(() => ({
          websiteId: 'factory-id',
          src: 'https://factory.example.com/script.js',
        })),
      ],
    });

    const service = TestBed.inject(UmamiService);
    expect(service).toBeTruthy();
  });
});
