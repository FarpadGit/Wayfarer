import { Component, effect, OnDestroy, signal, untracked } from '@angular/core';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import {
  TransitionService,
  navStates,
} from '../../services/transition.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import backgroundImages from '../../../assets/bgs/index.json';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss', './animations.scss'],
})
export class BackgroundComponent implements OnDestroy {
  constructor(
    private transitionService: TransitionService,
    private animationService: AnimationService,
  ) {
    this.transitionSub = this.transitionService.navigationState.subscribe(
      (navState) => {
        if (navState === navStates.waiting) {
          const newBgImage = this.getRandomBgImage();
          if (this.bgImage() === newBgImage) this.onImgLoad();
          else this.bgImage.set(newBgImage);
        }
      },
    );

    effect(() => {
      const state = animationService.bgAnimationState();
      if ([bgStates.entering, bgStates.quickEntering].includes(state))
        window.scrollTo({ top: 0, behavior: 'instant' });
    });

    effect(() => {
      const bgImage = untracked(() => this.bgImage());
      if (this.onPostPage && bgImage === '')
        this.bgImage.set(this.getRandomBgImage());
    });
  }

  transitionSub: Subscription | undefined;

  ngOnDestroy(): void {
    this.transitionSub?.unsubscribe();
  }

  get onPostPage() {
    return (
      this.animationService.bgAnimationState() === bgStates.entered ||
      this.transitionService.currentUrl().includes('/posts')
    );
  }

  get animationState() {
    const filter = [
      bgStates.entering,
      bgStates.quickEntering,
      bgStates.entered,
    ];
    const state = this.animationService.bgAnimationState();
    return filter.includes(state) ? state : '';
  }

  get blur() {
    return this.animationService.blur();
  }

  private bgImage = signal('');
  get backgroundImage() {
    return this.bgImage();
  }

  private getRandomBgImage() {
    const index = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[index].name + '.jpg';
  }

  private navigate() {
    this.animationService.blur.set(true);
    this.transitionService.callDelayedNavigate(1000);
  }

  onImgLoad() {
    this.transitionService.readyToNavigate();
  }

  handleAnimationEnd() {
    if (this.animationState === bgStates.entering) this.navigate();
  }
}
