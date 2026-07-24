# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-07-24

### Added

- **`onScriptError` config callback**: `UmamiConfig` now accepts an optional
  `onScriptError?: (src: string) => void`, invoked when the tracker script
  fails to load. Useful for reporting to an error tracking service.
- **Duplicate script guard**: if a script tag with the same `websiteId` is
  already in the DOM (double bootstrap, hot module replacement), the service
  reuses it instead of injecting a second copy.

### Changed

- **`provideUmami()` / `provideUmamiWithFactory()` now instantiate the service
  eagerly** via an environment initializer. Previously the tracker script only
  loaded once something injected `UmamiService`; apps relying solely on
  `autoTrack` never loaded it. No action needed — existing setups keep working.
- **`disable()` now actually stops tracking**: it sets the `umami.disabled`
  flag in localStorage (the mechanism the Umami script itself honors) in
  addition to removing the script tag. Previously an already-loaded tracker
  kept sending events after `disable()`. Note the opt-out now persists across
  page loads; re-enable with `localStorage.removeItem('umami.disabled')`.
- **Destroying the app no longer opts the user out**: `ngOnDestroy` performs
  cleanup (removes the script tag, clears the queue) without writing the
  persistent `umami.disabled` flag.
- **Broader Do Not Track detection**: the `doNotTrack` option now recognizes
  both `'1'` and `'yes'`, on `navigator.doNotTrack` as well as
  `window.doNotTrack`, covering more browsers.
- **`UmamiTrackDirective` modernized with signal inputs** and a single
  dynamically bound event listener instead of six permanent host listeners.
  Template usage is unchanged (`umamiTrack`, `umamiTrackData`, `umamiTrackOn`);
  only code reading the directive's properties programmatically needs to call
  them as signals (e.g. `dir.umamiTrack()`).
- Router tracking migrated from the deprecated `APP_INITIALIZER` token to
  Angular 19's `provideAppInitializer()`.

### Fixed

- **Unbounded event queue on invalid script URL**: when `src` failed
  validation, tracking calls were queued forever with nothing to flush them.
  They are now discarded, matching the failed-load behavior.
- Events queued before a script load failure are discarded and no further
  events are enqueued after the failure.

## [1.2.0] - 2025

### Added

- Script load queue: tracking calls made before the Umami script finishes
  loading are queued and flushed on load, instead of being dropped.
- Error logging when the tracker script fails to load.

### Changed

- Updated project to Angular 19.2.18.
- Added ESLint and Prettier tooling.

## [1.0.0]

### Added

- Initial release: `UmamiService` (`trackPageView`, `trackEvent`, `identify`,
  `isAvailable`, `disable`), `provideUmami()` / `provideUmamiWithFactory()`,
  `UmamiTrackDirective`, `withRouterTracking()`, `injectUmami()`, SSR-safe
  browser checks, script URL validation, Do Not Track and domain restrictions.

[1.3.0]: https://github.com/mitsuru17/ngx-umami/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/mitsuru17/ngx-umami/compare/v1.0.0...v1.2.0
[1.0.0]: https://github.com/mitsuru17/ngx-umami/releases/tag/v1.0.0
