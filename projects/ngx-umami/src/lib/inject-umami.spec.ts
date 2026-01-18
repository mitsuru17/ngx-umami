import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { injectUmami } from './inject-umami';
import { UmamiService } from './umami.service';
import { UMAMI_CONFIG } from './umami.token';

@Component({
  template: '',
  standalone: true,
})
class TestComponent {
  umami = injectUmami();
}

describe('injectUmami', () => {
  beforeEach(() => {
    document.querySelectorAll('script[data-website-id]').forEach((el) => el.remove());
  });

  afterEach(() => {
    document.querySelectorAll('script[data-website-id]').forEach((el) => el.remove());
  });

  it('should return UmamiService instance', () => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        UmamiService,
        {
          provide: UMAMI_CONFIG,
          useValue: {
            websiteId: 'test',
            src: 'https://test.example.com/script.js',
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    expect(component.umami).toBeTruthy();
    expect(component.umami instanceof UmamiService).toBeTrue();
  });

  it('should return the same instance as inject(UmamiService)', () => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        UmamiService,
        {
          provide: UMAMI_CONFIG,
          useValue: {
            websiteId: 'test',
            src: 'https://test.example.com/script.js',
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    const directService = TestBed.inject(UmamiService);

    expect(component.umami).toBe(directService);
  });
});
