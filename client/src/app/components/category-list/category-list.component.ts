import {
  Component,
  effect,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CategoryListService } from '../../services/category-list.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import { CategoryItemComponent } from './category-item/category-item.component';
import { IconBtnComponent } from '../UI/icon-btn/icon-btn.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerPlus } from '@ng-icons/tabler-icons';

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
    NgOptimizedImage,
    CategoryItemComponent,
    NgIconComponent,
    IconBtnComponent,
  ],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss', './animations.scss'],
  viewProviders: [
    provideIcons({
      tablerPlus,
    }),
  ],
})
export class CategoryListComponent {
  constructor(
    private categoryListService: CategoryListService,
    private animationService: AnimationService,
  ) {
    effect(() => {
      if (this.animationService.bgAnimationState() === bgStates.collapsing)
        this.animState.set(animStates.animating);
    });
  }

  @ViewChild('addCategoryInput')
  addCategoryInput: ElementRef<HTMLInputElement> | null = null;

  animState = signal(animStates.none);
  isInputActive = signal(false);
  inputSlideDuration = 1000;

  get animationState() {
    const filter = [animStates.animating, animStates.finished];
    const state = this.animState();
    return filter.includes(state) ? state : '';
  }

  get animStates() {
    return animStates;
  }

  get reloading() {
    return this.categoryListService.loading();
  }

  get categories() {
    return this.categoryListService.allCategories();
  }

  get activeCategory() {
    return this.categoryListService.getCurrentCategory();
  }

  showInput() {
    this.isInputActive.set(true);
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
