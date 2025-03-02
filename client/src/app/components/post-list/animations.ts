import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AnimationService } from '../../services/animation.service';

export enum animStates {
  none = 'none',
  animating = 'animating',
  finished = 'finished',
}

export const listAnimations = trigger('list-fade-in-out', [
  transition(':enter', [
    style({ opacity: 0, top: '20px' }),
    animate('0.5s ease', style({ opacity: 1, top: '0px' })),
  ]),
  state(
    animStates.animating,
    style({
      'overflow-y': 'clip',
      'overflow-x': 'visible',
      'pointer-events': 'none',
    })
  ),
  state(animStates.finished, style({ visibility: 'hidden' })),
  transition(
    '* => ' + animStates.finished,
    animate('0.2s', style({ opacity: 0 }))
  ),
]);

export const collapseAnimations = trigger('collapsable', [
  state(
    animStates.animating,
    style({
      translate: '0 calc(-100% + var(--app-post-list-header-height))',
      'overflow-y': 'clip',
      'overflow-x': 'visible',
    })
  ),
  transition(
    '* => ' + animStates.animating,
    animate('1.0s ' + AnimationService.easingFunction)
  ),
]);

export const listItemAnimations = trigger('items-enter-leave', [
  transition(':enter', [
    style({
      translate: '-100%',
    }),
    animate('0.5s {{delay-in}}ms ease', style({ translate: '0%' })),
  ]),
  transition(':leave', [
    style({
      position: 'absolute',
      width: '100%',
      top: 'calc({{i}} * 100% / 6)',
    }),
    animate('0.5s {{delay-out}}ms ease', style({ translate: '100%' })),
  ]),
]);

export const emptyListLabelAnimations = trigger('label-fade-in', [
  transition(':enter', [
    style({ translate: '0 -10%', opacity: 0 }),
    animate('0.5s 0.6s ease', style({ translate: '0 0%', opacity: 1 })),
  ]),
]);
