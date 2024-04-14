import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

type navStates = 'none' | 'requesting' | 'approved' | 'ok';

@Injectable({
  providedIn: 'root',
})
export class TransitionService {
  constructor(private router: Router) {}

  firstTime = true;
  navigationState: navStates = 'none';
  redirectUrl = '';
  private callbackOnRequest: () => void = () => {};

  addCallback(callback: () => void) {
    this.callbackOnRequest = callback;
  }

  setNavigate(redirectUrl: string) {
    this.redirectUrl = redirectUrl;
  }

  callNavigate(redirectUrl?: string) {
    if (redirectUrl) this.setNavigate(redirectUrl);
    if (this.navigationState === 'ok') this.beginNavigate();
    else {
      this.navigationState = 'requesting';
      this.callbackOnRequest();
    }
  }

  readyToNavigate() {
    if (this.navigationState === 'none') this.navigationState = 'ok';
    else {
      this.navigationState = 'approved';
      this.beginNavigate();
    }
  }

  beginNavigate() {
    this.router.navigateByUrl(this.redirectUrl);
    this.navigationState = 'none';
    document.body.classList.remove('blur');
  }
}
