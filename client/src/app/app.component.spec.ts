import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component } from '@angular/core';
import { AppComponent } from './app.component';
import { AnimationService, bgStates } from './services/animation.service';
import { BackgroundComponent } from './components/background/background.component';

@Component({
  selector: 'app-background',
  standalone: true,
  template: '',
})
export class mockComponent {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: AnimationService,
          useValue: {
            bgAnimationState: () => bgStates.none,
            blur: () => false,
          },
        },
      ],
    })
      .overrideComponent(AppComponent, {
        remove: { imports: [BackgroundComponent] },
        add: { imports: [mockComponent] },
      })
      .compileComponents();

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
      (e) => e.name === 'app-background',
    );

    expect(backgroundComponent).toBeTruthy();
  });

  it('should display floating login button', () => {
    const loginButton = fixture.debugElement.query(
      (e) => e.name === 'app-login-button',
    );

    expect(loginButton).toBeTruthy();
  });
});
