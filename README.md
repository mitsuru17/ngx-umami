# ngx-umami

Angular library for [Umami Analytics](https://umami.is/) - privacy-focused, lightweight analytics tracking for Angular applications.

## Features

- Easy integration with Angular 17+
- SSR compatible (Angular Universal)
- Automatic page view tracking with Angular Router
- Custom event tracking
- User session identification
- Template directive for declarative tracking
- Respects Do Not Track browser setting
- Domain restrictions support
- Full TypeScript support

## Installation

```bash
npm install ngx-umami
```

## Quick Start

### 1. Configure the provider

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideUmami } from 'ngx-umami';

export const appConfig: ApplicationConfig = {
  providers: [
    provideUmami({
      websiteId: 'your-website-id',
      src: 'https://analytics.example.com/script.js'
    })
  ]
};
```

### 2. Track events in your components

```typescript
import { Component } from '@angular/core';
import { injectUmami } from 'ngx-umami';

@Component({
  selector: 'app-example',
  template: `<button (click)="onSignup()">Sign Up</button>`
})
export class ExampleComponent {
  private umami = injectUmami();

  onSignup() {
    this.umami.trackEvent('signup_click', { plan: 'premium' });
  }
}
```

## Configuration Options

```typescript
provideUmami({
  // Required
  websiteId: 'your-website-id',
  src: 'https://analytics.example.com/script.js',

  // Optional
  enabled: true,              // Enable/disable tracking (default: true)
  autoTrack: true,            // Auto track page views (default: true)
  doNotTrack: false,          // Honor browser DNT setting (default: false)
  domains: ['example.com'],   // Restrict to specific domains
  tag: 'production',          // Tag for filtering in dashboard
  excludeSearch: false,       // Exclude URL search params
  excludeHash: false,         // Exclude URL hash
  hostUrl: 'https://...'      // Custom host URL for proxy setups
});
```

### Factory Configuration

Use `provideUmamiWithFactory` when configuration depends on other services:

```typescript
import { provideUmamiWithFactory } from 'ngx-umami';
import { ConfigService } from './config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideUmamiWithFactory(
      (configService: ConfigService) => ({
        websiteId: configService.umamiWebsiteId,
        src: configService.umamiSrc,
        enabled: configService.isProduction
      }),
      [ConfigService]
    )
  ]
};
```

## Router Tracking

Enable automatic page view tracking on route changes:

```typescript
import { provideRouter } from '@angular/router';
import { provideUmami, withRouterTracking } from 'ngx-umami';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideUmami({
      websiteId: 'your-website-id',
      src: 'https://analytics.example.com/script.js',
      autoTrack: false // Disable auto tracking since router handles it
    }),
    withRouterTracking()
  ]
};
```

## API Reference

### UmamiService

#### `trackPageView(payload?)`

Track a page view manually.

```typescript
// Track current page
umami.trackPageView();

// Track with custom data
umami.trackPageView({
  url: '/custom-page',
  title: 'Custom Page',
  referrer: 'https://google.com'
});
```

#### `trackEvent(eventName, eventData?)`

Track a custom event.

```typescript
// Simple event
umami.trackEvent('button_click');

// Event with data (max 50 properties)
umami.trackEvent('purchase', {
  product: 'Premium Plan',
  price: 99.99,
  currency: 'USD'
});
```

#### `identify(sessionIdOrData, sessionData?)`

Identify a user session.

```typescript
// With ID only
umami.identify('user-123');

// With ID and data
umami.identify('user-123', { plan: 'premium', role: 'admin' });

// With data only
umami.identify({ plan: 'premium', role: 'admin' });
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

Declarative event tracking in templates:

```html
<!-- Simple click tracking -->
<button umamiTrack="signup_click">Sign Up</button>

<!-- With event data -->
<button
  umamiTrack="purchase"
  [umamiTrackData]="{ product: 'Premium', price: 99 }">
  Buy Now
</button>

<!-- Track on different events -->
<input
  umamiTrack="search_focus"
  umamiTrackOn="focus"
  placeholder="Search...">
```

Supported events: `click`, `focus`, `blur`, `mouseenter`, `mouseleave`, `submit`

Import the directive:

```typescript
import { UmamiTrackDirective } from 'ngx-umami';

@Component({
  imports: [UmamiTrackDirective],
  // ...
})
```

## SSR Support

ngx-umami is fully compatible with Angular SSR. The library automatically detects server-side rendering and disables tracking to prevent errors.

## License

ngx-umami is licensed under the MIT License.

You are free to use, modify, and distribute this software in both open-source
and commercial projects, with proper attribution.

## Disclaimer

ngx-umami is an independent community-driven project.

It is not affiliated with, endorsed by, or maintained by the Umami team or
its contributors.

"Umami" is a trademark of its respective owners.
