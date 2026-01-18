# ngx-umami

Angular library for [Umami Analytics](https://umami.is/) - a privacy-focused, lightweight analytics platform.

[![npm version](https://badge.fury.io/js/ngx-umami.svg)](https://www.npmjs.com/package/ngx-umami)
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
npm install ngx-umami
```

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
  hostUrl: 'https://proxy.example.com'  // Custom data endpoint
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
```

#### `trackEvent(eventName, eventData?)`

Track a custom event.

```typescript
// Simple event
umami.trackEvent('button_click');

// Event with data (max 50 properties)
umami.trackEvent('form_submit', {
  formName: 'contact',
  fields: 5,
  hasAttachment: true
});
```

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

Disable tracking programmatically.

```typescript
umami.disable();
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

### withRouterTracking()

Enable automatic page view tracking on Angular router navigation.

```typescript
// app.config.ts
providers: [
  provideRouter(routes),
  provideUmami({
    websiteId: 'xxx',
    src: 'https://...',
    autoTrack: false  // Disable Umami's auto-track since router handles it
  }),
  withRouterTracking()
]
```

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

## SSR Considerations

The library automatically handles server-side rendering. Tracking is only active in the browser environment - no configuration needed.

## License

MIT
