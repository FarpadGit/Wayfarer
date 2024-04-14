import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoginService, userAccounts } from './services/login.service';
import { AnimationService } from './services/animation.service';
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
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private loginService: LoginService,
    private animationService: AnimationService
  ) {}

  ngOnInit(): void {
    this.loginService.loginUser(userAccounts.GUEST);
  }

  get animationState() {
    return this.animationService.bgAnimationState;
  }
}
