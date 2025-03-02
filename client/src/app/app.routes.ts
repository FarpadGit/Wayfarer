import { Routes } from '@angular/router';
import { PostComponent } from './components/post/post.component';
import { LandingComponent } from './components/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'posts/:id', component: PostComponent },
  { path: '**', redirectTo: '' },
];
