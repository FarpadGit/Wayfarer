import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matChevronLeft,
  matChevronRight,
} from '@ng-icons/material-icons/baseline';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NgxPaginationModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  viewProviders: [
    provideIcons({
      matChevronLeft,
      matChevronRight,
    }),
  ],
})
export class PaginatorComponent {
  currentPage: number = 0;
  itemsPerPage: number = 6;
}
