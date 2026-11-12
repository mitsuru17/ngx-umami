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

  /**
   * Called when the tracker script fails to load
   * Useful for reporting to an error tracking service
   */
  onScriptError?: (src: string) => void;

  /**
   * Track page views automatically (default: true)
   * Set to false to keep the tracker active (events, `data-umami-event`)
   * while sending page views manually. Requires Umami v3.2.0+
   */
  autoPageview?: boolean;

  /**
   * Distinct ID assigned to the visitor when the script loads (max 50 characters)
   * Avoid personal data such as email addresses. Requires Umami v3.4.0+
   */
  distinctId?: string;

  /**
   * Collect Core Web Vitals automatically (default: false)
   * Requires Umami v3.1.0+
   */
  performance?: boolean;

  /**
   * Name of a global function (`window[beforeSend]`) run before each send.
   * It receives `(type, payload)` and can return a modified payload, or a
   * falsy value to cancel the send. Requires Umami v2.18.0+
   *
   * The function MUST be defined on `window` before the tracker script loads.
   */
  beforeSend?: string;

  /**
   * Credentials mode used when sending data (default: 'omit')
   * Set to 'include' when your collect endpoint sits behind a cookie-based proxy
   */
  fetchCredentials?: 'omit' | 'same-origin' | 'include';
}

/**
 * Value allowed inside event data (any JSON-like value)
 */
export type UmamiEventDataValue =
  | string
  | number
  | boolean
  | null
  | UmamiEventData
  | UmamiEventDataValue[];

/**
 * Event data payload for custom events
 * Supports up to 50 properties (an array counts as one)
 * Strings (and arrays, stringified) are limited to 500 characters
 * Numbers are limited to 4 decimal places
 */
export interface UmamiEventData {
  [key: string]: UmamiEventDataValue;
}

/**
 * Payload for page view tracking
 */
export interface UmamiPageViewPayload {
  /** Website ID, for explicit multi-site tracking */
  website?: string;
  url?: string;
  title?: string;
  referrer?: string;
  hostname?: string;
  language?: string;
  /** Screen dimensions, e.g. '1920x1080' */
  screen?: string;
  /** Tag configured on the tracker script */
  tag?: string;
  /** Distinct ID of the current visitor */
  id?: string;
}

/**
 * Payload for a custom event built through the callback overload.
 * Event names are truncated by Umami past 50 characters.
 */
export interface UmamiEventPayload extends UmamiPageViewPayload {
  name: string;
  data?: UmamiEventData;
}

/**
 * Callback receiving the default properties and returning the payload to send
 */
export type UmamiTrackModifier = (
  props: UmamiPageViewPayload
) => UmamiPageViewPayload | UmamiEventPayload;

/**
 * Session identification data. An `id` string sets the Distinct ID.
 */
export type UmamiIdentifyData = UmamiEventData;

/**
 * Global Umami tracker interface
 */
export interface UmamiTracker {
  track(eventName?: string, eventData?: UmamiEventData): void | Promise<void>;
  track(payload: UmamiPageViewPayload): void | Promise<void>;
  track(callback: UmamiTrackModifier): void | Promise<void>;
  identify(sessionId: string, sessionData?: UmamiIdentifyData): void | Promise<void>;
  identify(sessionData: UmamiIdentifyData): void | Promise<void>;
  /** Current session cache token and website ID (Umami v3+) */
  getSession?(): { cache: string | undefined; website: string | null };
}

/**
 * Extend Window interface to include umami
 */
declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}
