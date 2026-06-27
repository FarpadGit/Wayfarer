import { Component } from '@angular/core';
import { LoaderComponent } from '../UI/loader/loader.component';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: '<app-loader text="Átirányítás..."></app-loader>',
  imports: [LoaderComponent],
})
export class RedirectComponent {
  constructor(private loginService: LoginService) {}
  //without this the redirect will hang indefinitely for some reason...
  dummy = this.loginService.currentUserEmail();
}
