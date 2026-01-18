import { InjectionToken } from '@angular/core';
import { UmamiConfig } from './umami.types';

/**
 * Injection token for Umami configuration
 */
export const UMAMI_CONFIG = new InjectionToken<UmamiConfig>('UMAMI_CONFIG');
