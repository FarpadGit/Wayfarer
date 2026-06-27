import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AnimationService, bgStates } from './services/animation.service';
import { BackgroundComponent } from './components/background/background.component';
import { LoginButtonComponent } from './components/UI/login-button/login-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoginButtonComponent,
    BackgroundComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', './animations.scss'],
})
export class AppComponent {
  constructor(private animationService: AnimationService) {}

  get isEntering() {
    return this.animationService.bgAnimationState() === bgStates.entering;
  }

  get animationState() {
    const filter = [
      bgStates.entering,
      bgStates.quickEntering,
      bgStates.exiting,
    ];
    const state = this.animationService.bgAnimationState();
    return filter.includes(state) ? state : '';
  }

  get blur() {
    return this.animationService.blur();
  }
}
