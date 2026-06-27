import { Routes } from '@angular/router';
import { PostComponent } from './components/post/post.component';
import { LandingComponent } from './components/landing/landing.component';
import { RedirectComponent } from './components/redirect/redirect.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'posts/:slug', component: PostComponent },
  { path: 'redirect', component: RedirectComponent },
  { path: '**', redirectTo: '' },
];
