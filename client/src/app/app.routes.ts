import { Routes } from '@angular/router';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostComponent } from './components/post/post.component';

export const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'posts/:id', component: PostComponent },
];
