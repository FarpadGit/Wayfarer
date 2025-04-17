import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AnimationService, bgStates } from './services/animation.service';
import { TransitionService } from './services/transition.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: AnimationService,
          useValue: { bgAnimationState: bgStates.none },
        },
        {
          provide: TransitionService,
          useValue: { blur: false, currentUrl: '/' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    rootDiv = fixture.debugElement.nativeElement.querySelector('.app-wrapper');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display Background Component', () => {
    const backgroundComponent = fixture.debugElement.query(
      (e) => e.name === 'app-background'
    );

    expect(backgroundComponent).toBeTruthy();
  });

  it('should display floating login button', () => {
    const loginButton = fixture.debugElement.query(
      (e) => e.name === 'app-login-button'
    );

    expect(loginButton).toBeTruthy();
  });
});
