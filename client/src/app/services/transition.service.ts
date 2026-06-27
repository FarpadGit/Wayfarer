import { Injectable, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

export enum navStates {
  none = 'none',
  waiting = 'waiting',
  ready = 'ready',
}

@Injectable({
  providedIn: 'root',
})
export class TransitionService implements OnDestroy {
  constructor(private router: Router) {
    this.routersub = this.router.events.subscribe(
      (event) =>
        event instanceof NavigationEnd && this._currentUrl.set(event.url),
    );
  }

  firstTime = true;
  private navState = new BehaviorSubject<navStates>(navStates.none);
  get navigationState() {
    return this.navState.asObservable();
  }

  private _currentUrl = signal('/');
  get currentUrl() {
    return this._currentUrl.asReadonly();
  }

  private redirectUrl = '';
  private routersub: Subscription | undefined;

  ngOnDestroy(): void {
    this.routersub?.unsubscribe();
  }

  setNavigate(redirectUrl: string) {
    this.redirectUrl = redirectUrl;
  }

  callNavigate(redirectUrl?: string, force: boolean = false) {
    if (redirectUrl) this.setNavigate(redirectUrl);
    if (this.navState.value === navStates.ready || force) this.beginNavigate();
    else this.navState.next(navStates.waiting);
  }

  callDelayedNavigate(
    delay: number,
    redirectUrl?: string,
    force: boolean = false,
  ) {
    setTimeout(() => {
      this.callNavigate(redirectUrl, force);
    }, delay);
  }

  readyToNavigate() {
    if (this.navState.value === navStates.waiting) this.beginNavigate();
    else this.navState.next(navStates.ready);
  }

  private beginNavigate() {
    this.router.navigateByUrl(this.redirectUrl);
    this.navState.next(navStates.none);
  }
}
