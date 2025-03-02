import { Component, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryListService } from '../../services/category-list.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import { CategoryItemComponent } from './category-item/category-item.component';
import { IconBtnComponent } from '../UI/icon-btn/icon-btn.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerPlus } from '@ng-icons/tabler-icons';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

enum animStates {
  none = 'none',
  animating = 'animating',
  finished = 'finished',
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    CategoryItemComponent,
    NgIconComponent,
    IconBtnComponent,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  viewProviders: [
    provideIcons({
      tablerPlus,
    }),
  ],
  animations: [
    trigger('fade-in', [
      transition(':enter', [
        style({ opacity: 0, top: '20px' }),
        animate('0.5s ease', style({ opacity: 1, top: '0px' })),
      ]),
    ]),
    trigger('collapsable', [
      state(animStates.animating, style({ translate: '100%' })),
      transition(
        '* => ' + animStates.animating,
        animate('1s ' + AnimationService.easingFunction)
      ),
    ]),
    trigger('fade-out', [
      state(
        animStates.animating,
        style({
          'border-right': '1px solid var(--app-category-list-border-color)',
        })
      ),
      state(animStates.finished, style({ visibility: 'hidden' })),
    ]),
  ],
})
export class CategoryListComponent {
  constructor(
    private categoryListService: CategoryListService,
    private animationService: AnimationService
  ) {
    effect(() => {
      if (this.animationService.bgAnimationState === bgStates.collapsing)
        this.animationState = animStates.animating;
    });
  }

  @ViewChild('addCategoryInput')
  addCategoryInput: ElementRef<HTMLInputElement> | null = null;

  animationState: animStates = animStates.none;
  isInputActive = false;
  inputSlideDuration = 1000;

  get animStates() {
    return animStates;
  }

  get reloading() {
    return this.categoryListService.loading;
  }
  get error() {
    return this.categoryListService.error;
  }
  get categories() {
    return this.categoryListService.allCategories;
  }

  get activeCategory() {
    return this.categoryListService.getCurrentCategory();
  }

  showInput() {
    this.isInputActive = true;
    setTimeout(() => {
      this.addCategoryInput?.nativeElement.focus();
    }, this.inputSlideDuration);
  }

  addCategory(title: string) {
    if (title === '') return;
    this.categoryListService.createCategory(title);
  }

  onCategoryItemClicked(id: string) {
    this.categoryListService.setCurrentCategory(id);
  }

  deleteCategory(id: string) {
    this.categoryListService.deleteCategory(id);
    if (id === this.categoryListService.getCurrentCategory())
      this.categoryListService.selectFirstCategory();
  }
}
