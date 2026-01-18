import { EnvironmentProviders, makeEnvironmentProviders, Provider } from '@angular/core';
import { UMAMI_CONFIG } from './umami.token';
import { UmamiConfig } from './umami.types';
import { UmamiService } from './umami.service';

/**
 * Provide Umami Analytics configuration for standalone Angular applications
 *
 * @param config Umami configuration options
 * @returns Environment providers for Umami
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { ApplicationConfig } from '@angular/core';
 * import { provideUmami } from 'ngx-umami';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideUmami({
 *       websiteId: 'your-website-id',
 *       src: 'https://analytics.example.com/script.js'
 *     })
 *   ]
 * };
 * ```
 *
 * @example
 * ```typescript
 * // With all options
 * provideUmami({
 *   websiteId: 'your-website-id',
 *   src: 'https://analytics.example.com/script.js',
 *   enabled: environment.production,
 *   autoTrack: true,
 *   doNotTrack: true,
 *   domains: ['example.com', 'www.example.com'],
 *   tag: 'production'
 * })
 * ```
 */
export function provideUmami(config: UmamiConfig): EnvironmentProviders {
  const providers: Provider[] = [
    {
      provide: UMAMI_CONFIG,
      useValue: config,
    },
    UmamiService,
  ];

  return makeEnvironmentProviders(providers);
}

/**
 * Configure Umami with a factory function
 * Useful when configuration depends on other services
 *
 * @param configFactory Factory function that returns UmamiConfig
 * @param deps Dependencies to inject into the factory
 * @returns Environment providers for Umami
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { provideUmamiWithFactory } from 'ngx-umami';
 * import { ConfigService } from './config.service';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideUmamiWithFactory(
 *       (configService) => ({
 *         websiteId: configService.umamiWebsiteId,
 *         src: configService.umamiSrc,
 *         enabled: configService.isProduction
 *       }),
 *       [ConfigService]
 *     )
 *   ]
 * };
 * ```
 */
export function provideUmamiWithFactory(
  configFactory: (...deps: unknown[]) => UmamiConfig,
  deps: unknown[] = []
): EnvironmentProviders {
  const providers: Provider[] = [
    {
      provide: UMAMI_CONFIG,
      useFactory: configFactory,
      deps,
    },
    UmamiService,
  ];

  return makeEnvironmentProviders(providers);
}
