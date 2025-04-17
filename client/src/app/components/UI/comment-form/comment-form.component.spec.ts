import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentFormComponent } from './comment-form.component';

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;
  let rootForm: HTMLFormElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;
    component.initialValue = '';
    rootForm = fixture.debugElement.nativeElement.querySelector('form');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial value in textarea', async () => {
    const testMessage = 'Initial Comment Message';
    const textAreaElement = rootForm.querySelector('textarea');

    component.initialValue = testMessage;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(textAreaElement?.value).toBe(testMessage);
  });

  it('should emit message value if submit button is clicked', (done) => {
    const testMessage = 'Some Message';
    component.onSubmit.subscribe((e) => {
      expect(e).toBe(testMessage);
      done();
    });

    const textAreaElement = rootForm.querySelector('textarea');
    const submitButtonElement = rootForm.querySelector('button');

    textAreaElement!.value = testMessage;
    textAreaElement?.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    submitButtonElement?.click();
  });

  it('should emit event if escape button is pressed in textarea', (done) => {
    const textAreaElement = rootForm.querySelector('textarea');
    component.onEscape.subscribe((e) => {
      expect(e).toBeFalsy();
      done();
    });

    textAreaElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape' })
    );
    fixture.detectChanges();
  });
});
