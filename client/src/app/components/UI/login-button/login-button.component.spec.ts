import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginButtonComponent } from './login-button.component';
import { ModalService } from 'ngx-modal-ease';

describe('LoginButtonComponent', () => {
  let component: LoginButtonComponent;
  let fixture: ComponentFixture<LoginButtonComponent>;
  let modalSpy: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    modalSpy = jasmine.createSpyObj('ModalService', ['open']);

    await TestBed.configureTestingModule({
      imports: [LoginButtonComponent],
      providers: [{ provide: ModalService, useValue: modalSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal if clicked', () => {
    const buttonElement: HTMLButtonElement =
      fixture.debugElement.nativeElement.querySelector('button');
    buttonElement.click();

    expect(modalSpy.open).toHaveBeenCalled();
  });
});
