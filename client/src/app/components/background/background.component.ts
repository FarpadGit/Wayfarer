import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TransitionService } from '../../services/transition.service';
import { AnimationService } from '../../services/animation.service';
import backgroundImages from '../../../assets/bgs/index.json';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss',
})
export class BackgroundComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private transitionService: TransitionService,
    private animationService: AnimationService
  ) {}

  ngOnInit(): void {
    this.animationService.addAnimationCallback(
      'none',
      () => (this.blur = false)
    );
    this.animationService.addAnimationCallback('entering', () =>
      window.scrollTo({ top: 0, behavior: 'instant' })
    );
    this.animationService.addAnimationCallback(
      'entered',
      () => (this.blur = false)
    );
    this.animationService.addAnimationCallback(
      'exiting',
      () => (this.blur = true)
    );

    this.transitionService.addCallback(() => {
      if (this.pathname.includes('/posts/')) {
        this.transitionService.readyToNavigate();
        return;
      }

      const newBgImage = this.getRandomBgImage();
      if (this._backgroundImage === newBgImage)
        this.transitionService.readyToNavigate();
      else this._backgroundImage = newBgImage;
    });
  }

  ngOnDestroy(): void {
    this.animationService.clearAnimationCallback('none');
    this.animationService.clearAnimationCallback('entered');
    this.animationService.clearAnimationCallback('exiting');
  }

  get pathname() {
    return this.router.url;
  }

  get animationState() {
    return this.animationService.bgAnimationState;
  }

  blur = false;

  private _backgroundImage = this.getRandomBgImage();

  get backgroundImage() {
    return this._backgroundImage;
  }

  private getRandomBgImage() {
    const index = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[index].name + '.jpg';
  }

  delayedNavigate() {
    setTimeout(() => {
      this.transitionService.callNavigate();
    }, 1000);
  }

  onImgLoad() {
    this.transitionService.readyToNavigate();
  }
}
