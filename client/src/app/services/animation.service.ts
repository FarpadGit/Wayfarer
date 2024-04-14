import { Injectable, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

type bgStates = 'none' | 'entering' | 'entered' | 'exiting';
@Injectable({
  providedIn: 'root',
})
export class AnimationService implements OnDestroy {
  bgAnimationStateSubject = new BehaviorSubject<bgStates>('none');
  public get bgAnimationState() {
    return this.bgAnimationStateSubject.value;
  }
  private set bgAnimationState(value: bgStates) {
    this.bgAnimationStateSubject.next(value);
  }
  bgAnimationCallbacks: Map<bgStates, (() => void)[]> = new Map([
    ['none', []],
    ['entering', []],
    ['entered', []],
    ['exiting', []],
  ]);
  private urlSub: Subscription | null = null;
  private callbacksSub: Subscription | null = null;

  constructor(private router: Router) {
    this.urlSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) this.endAnimation();
    });
    this.callbacksSub = this.bgAnimationStateSubject.subscribe((state) => {
      const callbacksForState = this.bgAnimationCallbacks.get(state);
      if (!callbacksForState || callbacksForState.length === 0) return;
      this.bgAnimationCallbacks.get(state)!.map((callback) => callback());
    });
  }

  ngOnDestroy(): void {
    this.urlSub?.unsubscribe();
    this.callbacksSub?.unsubscribe();
  }

  addAnimationCallback = (state: bgStates, callback: () => void) => {
    this.bgAnimationCallbacks.set(state, [
      ...this.bgAnimationCallbacks.get(state)!,
      callback,
    ]);
  };

  clearAnimationCallback = (state: bgStates) => {
    this.bgAnimationCallbacks.set(state, []);
  };

  startEnterAnimation = () => (this.bgAnimationState = 'entering');
  startExitAnimation = () => (this.bgAnimationState = 'exiting');
  endAnimation = () => {
    if (this.bgAnimationState === 'entering') this.bgAnimationState = 'entered';
    else this.bgAnimationState = 'none';
  };
}
