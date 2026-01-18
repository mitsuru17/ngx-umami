/*
 * Public API Surface of ngx-umami
 */

// Types
export type {
  UmamiConfig,
  UmamiEventData,
  UmamiPageViewPayload,
  UmamiIdentifyData,
  UmamiTracker,
} from './lib/umami.types';

// Token
export { UMAMI_CONFIG } from './lib/umami.token';

// Service
export { UmamiService } from './lib/umami.service';

// Providers
export { provideUmami, provideUmamiWithFactory } from './lib/provide-umami';
export { withRouterTracking } from './lib/umami-router-tracker';

// Directive
export { UmamiTrackDirective } from './lib/umami-track.directive';

// Utilities
export { injectUmami } from './lib/inject-umami';
