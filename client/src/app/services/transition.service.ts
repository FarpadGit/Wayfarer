import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export enum navStates {
  none = 'none',
  waiting = 'waiting',
  ready = 'ready',
}

@Injectable({
  providedIn: 'root',
})
export class TransitionService {
  constructor(private router: Router) {}

  firstTime = true;
  private navigationStateSignal = signal<navStates>(navStates.none);
  get navigationState() {
    return this.navigationStateSignal();
  }
  private set navigationState(value: navStates) {
    this.navigationStateSignal.set(value);
  }

  private blurSignal = signal<boolean>(false);
  get blur() {
    return this.blurSignal();
  }
  set blur(value: boolean) {
    this.blurSignal.set(value);
  }

  private redirectUrl = '';

  get currentUrl() {
    return this.router.url;
  }

  setNavigate(redirectUrl: string) {
    this.redirectUrl = redirectUrl;
  }

  callNavigate(redirectUrl?: string, force: boolean = false) {
    if (redirectUrl) this.setNavigate(redirectUrl);
    if (this.navigationState === navStates.ready || force) this.beginNavigate();
    else this.navigationState = navStates.waiting;
  }

  callDelayedNavigate(
    delay: number,
    redirectUrl?: string,
    force: boolean = false
  ) {
    setTimeout(() => {
      this.callNavigate(redirectUrl, force);
    }, delay);
  }

  readyToNavigate() {
    if (this.navigationState === navStates.waiting) this.beginNavigate();
    else this.navigationState = navStates.ready;
  }

  private beginNavigate() {
    this.router.navigateByUrl(this.redirectUrl);
    this.navigationState = navStates.none;
    this.blur = false;
  }
}
