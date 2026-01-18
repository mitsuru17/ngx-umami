/**
 * Configuration options for Umami Analytics
 */
export interface UmamiConfig {
  /**
   * Your Umami website ID (required)
   * Found in your Umami dashboard under Websites > Settings
   */
  websiteId: string;

  /**
   * The URL where your Umami instance is hosted (required)
   * Example: 'https://analytics.example.com'
   */
  src: string;

  /**
   * Enable or disable tracking (default: true)
   * Useful for disabling in development environments
   */
  enabled?: boolean;

  /**
   * Automatically track page views (default: true)
   * Set to false for manual page view tracking
   */
  autoTrack?: boolean;

  /**
   * Honor browser's Do Not Track setting (default: false)
   */
  doNotTrack?: boolean;

  /**
   * Restrict tracking to specific domains
   * Example: ['example.com', 'www.example.com']
   */
  domains?: string[];

  /**
   * Tag to assign to all events for filtering in dashboard
   */
  tag?: string;

  /**
   * Exclude URL search parameters from tracking
   */
  excludeSearch?: boolean;

  /**
   * Exclude URL hash from tracking
   */
  excludeHash?: boolean;

  /**
   * Custom host URL for sending analytics data
   * Useful when using a proxy
   */
  hostUrl?: string;
}

/**
 * Event data payload for custom events
 * Supports up to 50 properties
 * Strings are limited to 500 characters
 * Numbers are limited to 4 decimal places
 */
export type UmamiEventData = Record<string, string | number | boolean>;

/**
 * Payload for page view tracking
 */
export interface UmamiPageViewPayload {
  url?: string;
  title?: string;
  referrer?: string;
  hostname?: string;
}

/**
 * Session identification data
 */
export interface UmamiIdentifyData {
  [key: string]: string | number | boolean;
}

/**
 * Global Umami tracker interface
 */
export interface UmamiTracker {
  track(eventName?: string, eventData?: UmamiEventData): void;
  track(payload: UmamiPageViewPayload): void;
  track(callback: (props: UmamiPageViewPayload) => UmamiPageViewPayload): void;
  identify(sessionId: string, sessionData?: UmamiIdentifyData): void;
  identify(sessionData: UmamiIdentifyData): void;
}

/**
 * Extend Window interface to include umami
 */
declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}
