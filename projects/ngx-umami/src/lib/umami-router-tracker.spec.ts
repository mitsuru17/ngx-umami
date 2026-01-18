import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter, Routes } from '@angular/router';
import { Component } from '@angular/core';
import { UmamiRouterTracker, withRouterTracking } from './umami-router-tracker';
import { UmamiService } from './umami.service';
import { UMAMI_CONFIG } from './umami.token';

@Component({ template: '<div>Home</div>', standalone: true })
class HomeComponent {}

@Component({ template: '<div>About</div>', standalone: true })
class AboutComponent {}

@Component({ template: '<div>Contact</div>', standalone: true })
class ContactComponent {}

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'redirect', redirectTo: 'about' },
];

describe('UmamiRouterTracker', () => {
  let router: Router;
  let mockUmamiService: jasmine.SpyObj<UmamiService>;

  beforeEach(async () => {
    mockUmamiService = jasmine.createSpyObj('UmamiService', ['trackPageView']);

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        UmamiRouterTracker,
        { provide: UmamiService, useValue: mockUmamiService },
        {
          provide: UMAMI_CONFIG,
          useValue: {
            websiteId: 'test',
            src: 'https://test.example.com/script.js',
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    const tracker = TestBed.inject(UmamiRouterTracker);
    expect(tracker).toBeTruthy();
  });

  it('should track page view on navigation', fakeAsync(() => {
    const tracker = TestBed.inject(UmamiRouterTracker);
    tracker.init();

    router.navigate(['/about']);
    tick();

    expect(mockUmamiService.trackPageView).toHaveBeenCalledWith({ url: '/about' });
  }));

  it('should track multiple navigations', fakeAsync(() => {
    const tracker = TestBed.inject(UmamiRouterTracker);
    tracker.init();

    router.navigate(['/about']);
    tick();

    router.navigate(['/contact']);
    tick();

    expect(mockUmamiService.trackPageView).toHaveBeenCalledTimes(2);
    expect(mockUmamiService.trackPageView).toHaveBeenCalledWith({ url: '/about' });
    expect(mockUmamiService.trackPageView).toHaveBeenCalledWith({ url: '/contact' });
  }));

  it('should track urlAfterRedirects for redirected routes', fakeAsync(() => {
    const tracker = TestBed.inject(UmamiRouterTracker);
    tracker.init();

    router.navigate(['/redirect']);
    tick();

    expect(mockUmamiService.trackPageView).toHaveBeenCalledWith({ url: '/about' });
  }));
});

describe('withRouterTracking', () => {
  let mockUmamiService: jasmine.SpyObj<UmamiService>;

  beforeEach(async () => {
    mockUmamiService = jasmine.createSpyObj('UmamiService', ['trackPageView']);

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        withRouterTracking(),
        { provide: UmamiService, useValue: mockUmamiService },
        {
          provide: UMAMI_CONFIG,
          useValue: {
            websiteId: 'test',
            src: 'https://test.example.com/script.js',
          },
        },
      ],
    }).compileComponents();
  });

  it('should provide UmamiRouterTracker', () => {
    const tracker = TestBed.inject(UmamiRouterTracker);
    expect(tracker).toBeTruthy();
  });

  it('should initialize router tracking via APP_INITIALIZER', fakeAsync(() => {
    const router = TestBed.inject(Router);

    router.navigate(['/about']);
    tick();

    expect(mockUmamiService.trackPageView).toHaveBeenCalledWith({ url: '/about' });
  }));
});
