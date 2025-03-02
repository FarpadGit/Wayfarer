import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TransitionService,
  navStates,
} from '../../services/transition.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import backgroundImages from '../../../assets/bgs/index.json';
import { dropDownAnimations, slideUpAnimations } from './animations';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss',
  animations: [dropDownAnimations, slideUpAnimations],
})
export class BackgroundComponent {
  constructor(
    private transitionService: TransitionService,
    private animationService: AnimationService
  ) {
    effect(() => {
      if (animationService.bgAnimationState === bgStates.none)
        this.blur = false;
      if (animationService.bgAnimationState === bgStates.entering)
        window.scrollTo({ top: 0, behavior: 'instant' });
      if (animationService.bgAnimationState === bgStates.entered)
        this.blur = false;
      if (animationService.bgAnimationState === bgStates.exiting)
        this.blur = true;
    });

    effect(
      () => {
        if (transitionService.navigationState === navStates.waiting) {
          const newBgImage = this.getRandomBgImage();
          if (this._backgroundImage === newBgImage)
            this.transitionService.readyToNavigate();
          else this._backgroundImage = newBgImage;
        }
      },
      { allowSignalWrites: true }
    );
  }

  get bgStates() {
    return bgStates;
  }

  get onPostPage() {
    return this.transitionService.currentUrl.includes('/post');
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

  navigate() {
    this.blur = true;
    this.transitionService.callDelayedNavigate(1000);
  }

  onImgLoad() {
    this.transitionService.readyToNavigate();
  }
}
