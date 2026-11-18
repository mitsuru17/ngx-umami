# ngx-umami

Angular library for [Umami Analytics](https://umami.is/) - a privacy-focused, lightweight analytics platform.

[![npm version](https://badge.fury.io/js/ngx-umami.svg)](https://www.npmjs.com/package/ngx-umami)
[![npm downloads](https://img.shields.io/npm/dm/ngx-umami.svg)](https://www.npmjs.com/package/ngx-umami)
[![Angular](https://img.shields.io/badge/Angular-17--21-dd0031.svg)](https://angular.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Easy Setup** - Simple standalone configuration with `provideUmami()`
- 📊 **Event Tracking** - Track custom events with optional data payloads
- 🔄 **Router Integration** - Automatic page view tracking on route changes
- 🎯 **Directive** - Declarative event tracking with `umamiTrack` directive
- 🔒 **Privacy First** - Respects Do Not Track, GDPR compliant
- 🌐 **SSR Compatible** - Works with Angular Universal/SSR
- 📦 **Tree-shakeable** - Only includes what you use

## Compatibility

| Angular Version | ngx-umami Version |
|-----------------|-------------------|
| 17.x - 21.x     | 1.x               |

## Installation

```bash
# Recommended
pnpm add ngx-umami

# Or with npm
npm install ngx-umami

# Or with yarn
yarn add ngx-umami
```

> **Note:** We recommend using [pnpm](https://pnpm.io/) for faster installs, better disk space efficiency, and improved security through strict, non-flat `node_modules` isolation that prevents packages from accessing dependencies they don't explicitly declare (phantom dependencies).

## Quick Start

### 1. Configure in your app

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideUmami, withRouterTracking } from 'ngx-umami';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideUmami({
      websiteId: 'your-website-id',
      src: 'https://analytics.yourdomain.com/script.js'
    }),
    // Optional: Enable automatic page view tracking on route changes
    withRouterTracking()
  ]
};
```

### 2. Track events in components

```typescript
import { Component } from '@angular/core';
import { injectUmami } from 'ngx-umami';

@Component({
  selector: 'app-checkout',
  template: `<button (click)="onPurchase()">Buy Now</button>`
})
export class CheckoutComponent {
  private umami = injectUmami();

  onPurchase() {
    this.umami.trackEvent('purchase', {
      product: 'Premium Plan',
      price: 99.99,
      currency: 'USD'
    });
  }
}
```

### 3. Or use the directive

```typescript
import { Component } from '@angular/core';
import { UmamiTrackDirective } from 'ngx-umami';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [UmamiTrackDirective],
  template: `
    <button umamiTrack="signup_click">Sign Up</button>

    <button
      umamiTrack="cta_click"
      [umamiTrackData]="{ location: 'header', variant: 'blue' }">
      Get Started
    </button>
  `
})
export class SignupComponent {}
```

## Configuration Options

```typescript
provideUmami({
  // Required
  websiteId: 'your-website-id',  // From Umami dashboard
  src: 'https://analytics.example.com/script.js',  // Your Umami script URL

  // Optional
  enabled: true,              // Enable/disable tracking (default: true)
  autoTrack: true,            // Auto track page views (default: true)
  doNotTrack: false,          // Honor browser DNT setting (default: false)
  domains: ['example.com'],   // Restrict to specific domains
  tag: 'production',          // Tag for filtering in dashboard
  excludeSearch: false,       // Exclude URL search params
  excludeHash: false,         // Exclude URL hash
  hostUrl: 'https://proxy.example.com',  // Custom data endpoint
  autoPageview: true,         // Auto page views while keeping the tracker active (Umami v3.2+)
  distinctId: 'visitor-1',    // Distinct ID set on load, max 50 chars (Umami v3.4+)
  performance: false,         // Collect Core Web Vitals (Umami v3.1+)
  beforeSend: 'myBeforeSend', // Name of a global function run before each send (Umami v2.18+)
  fetchCredentials: 'omit',   // 'omit' | 'same-origin' | 'include'
  onScriptError: (src) => {   // Called if the tracker script fails to load
    console.warn(`Umami failed to load from ${src}`);
  }
})
```

## API Reference

### UmamiService

#### `trackPageView(payload?)`

Track a page view manually.

```typescript
umami.trackPageView();

umami.trackPageView({
  url: '/custom-page',
  title: 'Custom Page Title',
  referrer: 'https://google.com'
});

// Modify the default properties
umami.trackPageView(props => ({ ...props, url: '/custom-page' }));
```

A payload object is merged over the tracker's default properties (`website`,
`hostname`, `url`, `referrer`, `title`, ...), so you only pass what you want to
override.

> **`beforeSend`:** the named function must exist on `window` *before* the tracker
> script loads. It receives `(type, payload)`; return the (modified) payload to
> send, or a falsy value to cancel.

#### `trackEvent(eventName, eventData?)`

Track a custom event.

```typescript
// Simple event
umami.trackEvent('button_click');

// Event with data (max 50 properties)
umami.trackEvent('form_submit', {
  formName: 'contact',
  fields: 5,
  hasAttachment: true,
  tags: ['a', 'b'],              // arrays and nested objects are supported
  meta: { source: 'footer' }
});
```

Umami limits: event names are truncated past 50 characters, strings (and
stringified arrays) to 500, numbers keep 4 decimals, and objects hold up to 50
properties.

#### `identify(sessionIdOrData, sessionData?)`

Identify user sessions.

```typescript
// With session ID
umami.identify('user-123');

// With session ID and data
umami.identify('user-123', {
  plan: 'premium',
  role: 'admin'
});

// With data only
umami.identify({
  plan: 'premium',
  signupDate: '2024-01-15'
});
```

#### `isAvailable()`

Check if tracking is available.

```typescript
if (umami.isAvailable()) {
  umami.trackEvent('ready');
}
```

#### `disable()`

Disable tracking programmatically. Sets the `umami.disabled` flag in
localStorage (the mechanism Umami itself honors), so the opt-out persists
across page loads until the flag is removed.

```typescript
umami.disable();

// To re-enable tracking later:
localStorage.removeItem('umami.disabled');
```

### UmamiTrackDirective

Declarative event tracking on DOM elements.

```html
<!-- Track click events -->
<button umamiTrack="signup">Sign Up</button>

<!-- With event data -->
<button
  umamiTrack="download"
  [umamiTrackData]="{ file: 'report.pdf', size: 1024 }">
  Download
</button>

<!-- Track different events -->
<input
  umamiTrack="search_focus"
  umamiTrackOn="focus"
  placeholder="Search...">

<form
  umamiTrack="form_submit"
  umamiTrackOn="submit">
  <!-- form fields -->
</form>
```

**Supported events:** `click`, `focus`, `blur`, `mouseenter`, `mouseleave`, `submit`

> **`umamiTrack` vs Umami's `data-umami-event`:** Umami's script also tracks
> clicks on elements with `data-umami-event="name"` and
> `data-umami-event-<key>="value"` attributes, but those values are always
> strings and only clicks are supported. `umamiTrack` sends typed data
> (numbers, booleans, nested objects) on any of the events above. Both can
> coexist; `data-umami-event` needs the tracker initialized (`autoTrack` not
> set to `false`).

### withRouterTracking()

Enable automatic page view tracking on Angular router navigation.

```typescript
// app.config.ts
providers: [
  provideRouter(routes),
  provideUmami({
    websiteId: 'xxx',
    src: 'https://...',
    autoPageview: false  // The router sends the page views (Umami v3.2+)
  }),
  withRouterTracking()
]
```

> **Avoid double counting:** Umami already tracks `history.pushState`
> navigations by itself, so with `withRouterTracking()` set
> `autoPageview: false` (Umami v3.2+); otherwise each navigation is counted twice.
>
> Prefer it over `autoTrack: false`: that sets `data-auto-track="false"`, which
> in Umami v3 turns off the whole tracker initialization (including
> `data-umami-event` attributes and referrer updates between routes), not just
> page views. Use `autoTrack: false` only on Umami versions older than v3.2.
>
> `excludeSearch` and `excludeHash` are applied to the tracked route URL.

### provideUmamiWithFactory()

Configure Umami using a factory function with dependency injection.

```typescript
import { provideUmamiWithFactory } from 'ngx-umami';
import { ConfigService } from './config.service';

providers: [
  provideUmamiWithFactory(
    (config: ConfigService) => ({
      websiteId: config.umamiWebsiteId,
      src: config.umamiSrc,
      enabled: config.isProduction
    }),
    [ConfigService]
  )
]
```

## Environment-based Configuration

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  umami: {
    websiteId: 'dev-website-id',
    src: 'https://analytics.example.com/script.js',
    enabled: false  // Disable in development
  }
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  umami: {
    websiteId: 'prod-website-id',
    src: 'https://analytics.example.com/script.js',
    enabled: true
  }
};

// app.config.ts
import { environment } from './environments/environment';

providers: [
  provideUmami(environment.umami)
]
```

## Umami Version Requirements

Most options work with any recent Umami version. These need a minimum version
of your Umami instance (older versions ignore them):

| Option / feature              | Minimum Umami version |
|-------------------------------|-----------------------|
| `beforeSend`                  | v2.18.0               |
| `performance`                 | v3.1.0                |
| `autoPageview`                | v3.2.0                |
| `distinctId`                  | v3.4.0                |

## Content Security Policy

If your app sends a Content Security Policy, allow the Umami host for both the
script and the data requests:

```
Content-Security-Policy:
  script-src 'self' https://analytics.example.com;
  connect-src 'self' https://analytics.example.com;
```

If you set `hostUrl` to a different endpoint (for example a proxy), add that
origin to `connect-src` as well.

## SSR Considerations

The library automatically handles server-side rendering. Tracking is only active in the browser environment - no configuration needed.

## License

MIT
