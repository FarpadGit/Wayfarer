import { Injectable, OnDestroy, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

export enum bgStates {
  none = 'none',
  collapsing = 'collapsing',
  entering = 'entering',
  quickEntering = 'quickEntering',
  entered = 'entered',
  exiting = 'exiting',
}

@Injectable({
  providedIn: 'root',
})
export class AnimationService implements OnDestroy {
  static easingFunction = 'cubic-bezier(0.87, 0, 0.13, 1)';

  constructor(private router: Router) {
    this.urlSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) this.endAnimation();
    });
  }

  private bgAnimationStateSignal = signal<bgStates>(bgStates.none);
  get bgAnimationState() {
    return this.bgAnimationStateSignal();
  }
  private set bgAnimationState(value: bgStates) {
    this.bgAnimationStateSignal.set(value);
  }
  private urlSub: Subscription | null = null;

  ngOnDestroy(): void {
    this.urlSub?.unsubscribe();
  }

  startCollapseAnimation = () => (this.bgAnimationState = bgStates.collapsing);
  startEnterAnimation = () => (this.bgAnimationState = bgStates.entering);
  startQuickEnterAnimation = () =>
    (this.bgAnimationState = bgStates.quickEntering);
  startExitAnimation = () => (this.bgAnimationState = bgStates.exiting);
  endAnimation = () => {
    if (
      [bgStates.entering, bgStates.quickEntering].includes(
        this.bgAnimationState,
      )
    )
      this.bgAnimationState = bgStates.entered;
    else this.bgAnimationState = bgStates.none;
  };
}
