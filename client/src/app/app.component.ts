import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TransitionService } from './services/transition.service';
import { AnimationService, bgStates } from './services/animation.service';
import { BackgroundComponent } from './components/background/background.component';
import { LoginButtonComponent } from './components/UI/login-button/login-button.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

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
  styleUrl: './app.component.scss',
  animations: [
    trigger('fade-in', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fade-out', [
      state(bgStates.entering, style({ opacity: 0, 'pointer-events': 'none' })),
      transition('* => ' + bgStates.entering, [animate('0.5s')]),
    ]),
  ],
})
export class AppComponent {
  constructor(
    private animationService: AnimationService,
    private transitionService: TransitionService
  ) {}

  get bgStates() {
    return bgStates;
  }

  get animationState() {
    return this.animationService.bgAnimationState;
  }

  get blur() {
    return this.transitionService.blur;
  }
}
