import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UmamiTrackDirective } from './umami-track.directive';
import { UmamiService } from './umami.service';
import { UMAMI_CONFIG } from './umami.token';

// prettier-ignore
@Component({
  template: `
    <button umamiTrack="button_click" id="clickBtn">Click Me</button>
    <button
      umamiTrack="data_click"
      [umamiTrackData]="{ category: 'test', value: 42 }"
      id="dataBtn"
    >
      With Data
    </button>
    <input umamiTrack="input_focus" umamiTrackOn="focus" id="focusInput" />
    <input umamiTrack="input_blur" umamiTrackOn="blur" id="blurInput" />
    <div umamiTrack="mouse_enter" umamiTrackOn="mouseenter" id="mouseEnterDiv">Hover</div>
    <div umamiTrack="mouse_leave" umamiTrackOn="mouseleave" id="mouseLeaveDiv">Hover Leave</div>
    <form umamiTrack="form_submit" umamiTrackOn="submit" id="submitForm">
      <button type="submit">Submit</button>
    </form>
  `,
  standalone: true,
  imports: [UmamiTrackDirective],
})
class TestHostComponent {}

describe('UmamiTrackDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let mockUmamiService: jasmine.SpyObj<UmamiService>;

  beforeEach(async () => {
    mockUmamiService = jasmine.createSpyObj('UmamiService', ['trackEvent']);

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
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

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should track click event by default', () => {
    const button = fixture.nativeElement.querySelector('#clickBtn');
    button.click();

    expect(mockUmamiService.trackEvent).toHaveBeenCalledWith('button_click', undefined);
  });

  it('should track click event with data', () => {
    const button = fixture.nativeElement.querySelector('#dataBtn');
    button.click();

    expect(mockUmamiService.trackEvent).toHaveBeenCalledWith('data_click', {
      category: 'test',
      value: 42,
    });
  });

  it('should track focus event when umamiTrackOn is focus', () => {
    const input = fixture.nativeElement.querySelector('#focusInput');
    input.dispatchEvent(new Event('focus'));

    expect(mockUmamiService.trackEvent).toHaveBeenCalledWith('input_focus', undefined);
  });

  it('should not track click when umamiTrackOn is focus', () => {
    const input = fixture.nativeElement.querySelector('#focusInput');
    input.click();

    expect(mockUmamiService.trackEvent).not.toHaveBeenCalledWith('input_focus', undefined);
  });

  it('should track blur event when umamiTrackOn is blur', () => {
    const input = fixture.nativeElement.querySelector('#blurInput');
    input.dispatchEvent(new Event('blur'));

    expect(mockUmamiService.trackEvent).toHaveBeenCalledWith('input_blur', undefined);
  });

  it('should track mouseenter event when umamiTrackOn is mouseenter', () => {
    const div = fixture.nativeElement.querySelector('#mouseEnterDiv');
    div.dispatchEvent(new Event('mouseenter'));

    expect(mockUmamiService.trackEvent).toHaveBeenCalledWith('mouse_enter', undefined);
  });

  it('should track mouseleave event when umamiTrackOn is mouseleave', () => {
    const div = fixture.nativeElement.querySelector('#mouseLeaveDiv');
    div.dispatchEvent(new Event('mouseleave'));

    expect(mockUmamiService.trackEvent).toHaveBeenCalledWith('mouse_leave', undefined);
  });

  it('should track submit event when umamiTrackOn is submit', () => {
    const form = fixture.nativeElement.querySelector('#submitForm');
    form.dispatchEvent(new Event('submit'));

    expect(mockUmamiService.trackEvent).toHaveBeenCalledWith('form_submit', undefined);
  });

  it('should not track click when umamiTrackOn is submit', () => {
    const form = fixture.nativeElement.querySelector('#submitForm');
    form.click();

    expect(mockUmamiService.trackEvent).not.toHaveBeenCalledWith('form_submit', undefined);
  });
});
