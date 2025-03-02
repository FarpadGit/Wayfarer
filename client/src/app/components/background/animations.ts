import {
  animate,
  animateChild,
  group,
  query,
  sequence,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AnimationService, bgStates } from '../../services/animation.service';

export const dropDownAnimations = trigger('drop-down', [
  state(
    bgStates.entering,
    style({
      position: 'fixed',
      height: '100vh',
      width: '100vw',
      'margin-left': '0px',
      'margin-right': '0px',
      'border-radius': '0px',
      'background-position': 'bottom',
      offset: 1,
    })
  ),
  transition('* => ' + bgStates.entering, [
    style({ position: 'fixed' }),
    group([
      sequence([
        animate(
          '0.5s ' + AnimationService.easingFunction,
          style({
            height: 'calc(100vh + var(--offset-top))',
            width: '100vw',
            'margin-left': '0px',
            'margin-right': '0px',
            'border-radius': '0px',
            'background-position': 'var(--background-offset)',
          })
        ),
        animate(
          '1s ' + AnimationService.easingFunction,
          style({
            height: '100vh',
            width: '100vw',
            'margin-left': '0px',
            'margin-right': '0px',
            'border-radius': '0px',
            'background-position': 'bottom',
          })
        ),
      ]),
      query('@slide-up', animateChild()),
    ]),
  ]),
]);

export const slideUpAnimations = trigger('slide-up', [
  state(bgStates.entering, style({ opacity: 0, bottom: '300%' })),
  transition('* => ' + bgStates.entering, [animate('1.5s ease')]),
]);
