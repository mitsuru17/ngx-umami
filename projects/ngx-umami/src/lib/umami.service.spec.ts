import { TestBed } from '@angular/core/testing';

import { UmamiService } from './umami.service';
import { UMAMI_CONFIG } from './umami.token';

describe('UmamiService', () => {
  let service: UmamiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UmamiService,
        {
          provide: UMAMI_CONFIG,
          useValue: {
            websiteId: 'test',
            scriptUrl: 'test',
          },
        },
      ],
    });
    service = TestBed.inject(UmamiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
