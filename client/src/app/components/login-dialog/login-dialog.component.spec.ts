import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginDialogComponent } from './login-dialog.component';
import { LoginService, userAccounts } from '../../services/login.service';
import { setSpyProperty } from '../../../test/test.utils';
import { ModalService } from 'ngx-modal-ease';

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;
  let loginSpy: jasmine.SpyObj<LoginService>;
  let modalSpy: jasmine.SpyObj<ModalService>;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    loginSpy = jasmine.createSpyObj(
      'LoginService',
      ['loginUser', 'logoutUser'],
      { currentUserName: '', currentUserEmail: '', isCurrentUserSignedIn: '' }
    );
    modalSpy = jasmine.createSpyObj('ModalService', ['close']);

    loginSpy.logoutUser.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [LoginDialogComponent],
      providers: [
        { provide: LoginService, useValue: loginSpy },
        { provide: ModalService, useValue: modalSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    rootDiv = fixture.debugElement.nativeElement.querySelector('.login-dialog');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display guest user info if logged in as guest', () => {
    setSpyProperty(loginSpy, 'currentUserName', userAccounts.GUEST.display);
    setSpyProperty(loginSpy, 'currentUserEmail', userAccounts.GUEST.email);
    fixture.detectChanges();
    const h2 = rootDiv.querySelector('h2');

    expect(component.isGuestUser).toBeTrue();
    expect(component.currentUserName).toBe(userAccounts.GUEST.display);
    expect(h2?.innerText.includes(component.currentUserName)).toBeTrue();
  });

  it('should display user info if user is logged in', () => {
    const mockUsername = 'Fake User';
    const mockUserEmail = 'user@email.com';
    setSpyProperty(loginSpy, 'currentUserName', mockUsername);
    setSpyProperty(loginSpy, 'currentUserEmail', mockUserEmail);
    fixture.detectChanges();
    const h2 = rootDiv.querySelector('h2');

    expect(component.isGuestUser).toBeFalse();
    expect(component.currentUserName).toBe(mockUsername);
    expect(h2?.innerText.includes(component.currentUserName)).toBeTrue();
  });

  it('should display login and cancel buttons if logged in as guest', () => {
    setSpyProperty(loginSpy, 'currentUserName', userAccounts.GUEST.display);
    setSpyProperty(loginSpy, 'currentUserEmail', userAccounts.GUEST.email);
    fixture.detectChanges();
    const buttons = rootDiv.querySelectorAll('button');
    const guestButton = rootDiv.querySelector('[data-test-guest-btn]');

    expect(component.isGuestUser).toBeTrue();
    expect(buttons.length).toBe(2);
    expect(guestButton).toBeFalsy();
  });

  it('should display login, cancel and "continue as guest" buttons if user is logged in', () => {
    setSpyProperty(loginSpy, 'currentUserName', 'Fake User');
    setSpyProperty(loginSpy, 'currentUserEmail', 'user@email.com');
    fixture.detectChanges();
    const buttons = rootDiv.querySelectorAll('button');
    const guestButton = rootDiv.querySelector('[data-test-guest-btn]');

    expect(component.isGuestUser).toBeFalse();
    expect(buttons.length).toBe(3);
    expect(guestButton).toBeTruthy();
  });

  it('should call loginUser on login button press if user is not logged in', () => {
    setSpyProperty(loginSpy, 'isCurrentUserSignedIn', false);
    const loginButton = rootDiv.querySelector(
      '[data-test-login-btn]'
    ) as HTMLButtonElement;
    loginButton.click();
    fixture.detectChanges();

    expect(loginSpy.logoutUser).not.toHaveBeenCalled();
    expect(loginSpy.loginUser).toHaveBeenCalled();
  });

  it('should first call logoutUser then loginUser on login button press if user is already logged in', async () => {
    setSpyProperty(loginSpy, 'isCurrentUserSignedIn', true);
    const loginButton = rootDiv.querySelector(
      '[data-test-login-btn]'
    ) as HTMLButtonElement;
    loginButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(loginSpy.logoutUser).toHaveBeenCalled();
    expect(loginSpy.loginUser).toHaveBeenCalled();
  });

  it('should first call logoutUser then loginUser on guest button press', () => {
    const guestButton = rootDiv.querySelector(
      '[data-test-guest-btn]'
    ) as HTMLButtonElement;
    guestButton.click();
    fixture.detectChanges();

    expect(loginSpy.logoutUser).toHaveBeenCalled();
    expect(loginSpy.loginUser).toHaveBeenCalledWith(userAccounts.GUEST);
    expect(modalSpy.close).toHaveBeenCalled();
  });

  it('should close modal on cancel button press', () => {
    const cancelButton = rootDiv.querySelector(
      '[data-test-cancel-btn]'
    ) as HTMLButtonElement;
    cancelButton.click();
    fixture.detectChanges();

    expect(modalSpy.close).toHaveBeenCalled();
  });
});
