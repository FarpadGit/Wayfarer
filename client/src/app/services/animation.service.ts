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
  constructor(private router: Router) {
    this.urlSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) this.endAnimation();
    });
  }

  blur = signal<boolean>(false);
  private bgState = signal<bgStates>(bgStates.none);
  get bgAnimationState() {
    return this.bgState.asReadonly();
  }
  private urlSub: Subscription | null = null;

  ngOnDestroy(): void {
    this.urlSub?.unsubscribe();
  }

  startCollapseAnimation = () => this.bgState.set(bgStates.collapsing);
  startEnterAnimation = () => this.bgState.set(bgStates.entering);
  startQuickEnterAnimation = () => {
    this.bgState.set(bgStates.quickEntering);
    this.blur.set(true);
  };
  startExitAnimation = () => {
    this.bgState.set(bgStates.exiting);
    this.blur.set(true);
  };
  endAnimation = () => {
    const isEntering = [bgStates.entering, bgStates.quickEntering].includes(
      this.bgState(),
    );
    if (isEntering) this.bgState.set(bgStates.entered);
    else this.bgState.set(bgStates.none);
    this.blur.set(false);
  };
}
