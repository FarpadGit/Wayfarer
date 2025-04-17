import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentComponent } from './comment.component';
import { CommentFormComponent } from '../UI/comment-form/comment-form.component';
import { LoginService } from '../../services/login.service';
import { PostService } from '../../services/post.service';
import {
  acceptDeleteConfirmDialogAnd,
  setSpyProperty,
} from '../../../test/test.utils';
import { mockComment } from '../../../test/mocks';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;
  let postSpy: jasmine.SpyObj<PostService>;
  let loginSpy: jasmine.SpyObj<LoginService>;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    postSpy = jasmine.createSpyObj('PostService', [
      'createComment',
      'updateComment',
      'deleteComment',
      'toggleCommentLike',
    ]);

    loginSpy = jasmine.createSpyObj('LoginService', [], {
      currentUserEmail: '',
    });

    await TestBed.configureTestingModule({
      imports: [CommentComponent],
      providers: [
        { provide: PostService, useValue: postSpy },
        { provide: LoginService, useValue: loginSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = mockComment;
    component.isReplying = false;
    component.isEditing = false;
    component.isDeleting = false;
    rootDiv = fixture.debugElement.nativeElement.querySelector('.comment');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display comment message, author, creation date, likes', () => {
    const messageElement = rootDiv.querySelector('.message') as HTMLDivElement;
    const nameElement = rootDiv
      .querySelector('.header')
      ?.querySelector('.name') as HTMLSpanElement;
    const dateElement = rootDiv
      .querySelector('.header')
      ?.querySelector('.date') as HTMLSpanElement;
    const likeButton = rootDiv
      .querySelector('[data-test-like-btn]')
      ?.querySelector('button');

    expect(messageElement.innerText).toBe(component.comment.message);
    expect(nameElement.innerText).toBe(component.comment.user.name);
    expect(dateElement.innerText).toBe(component.displayDate);
    expect(likeButton?.innerText).toBe(component.comment.likeCount.toString());
  });

  it('should only display like and reply buttons if author is not logged in', () => {
    const likeButton = rootDiv
      .querySelector('[data-test-like-btn]')
      ?.querySelector('button');
    const replyButton = rootDiv
      .querySelector('[data-test-reply-btn]')
      ?.querySelector('button');
    const editButton = rootDiv
      .querySelector('[data-test-edit-btn]')
      ?.querySelector('button');
    const deleteButton = rootDiv
      .querySelector('[data-test-delete-btn]')
      ?.querySelector('button');

    expect(likeButton).toBeTruthy();
    expect(replyButton).toBeTruthy();
    expect(editButton).toBeFalsy();
    expect(deleteButton).toBeFalsy();
  });

  it('should display like, reply, edit and delete buttons if author is logged in', () => {
    setSpyProperty(loginSpy, 'currentUserEmail', component.comment.user.email);
    fixture.detectChanges();
    const likeButton = rootDiv
      .querySelector('[data-test-like-btn]')
      ?.querySelector('button');
    const replyButton = rootDiv
      .querySelector('[data-test-reply-btn]')
      ?.querySelector('button');
    const editButton = rootDiv
      .querySelector('[data-test-edit-btn]')
      ?.querySelector('button');
    const deleteButton = rootDiv
      .querySelector('[data-test-delete-btn]')
      ?.querySelector('button');

    expect(likeButton).toBeTruthy();
    expect(replyButton).toBeTruthy();
    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
  });

  it('should call toggleCommentLike if like button is pressed', () => {
    const likeButton = rootDiv
      .querySelector('[data-test-like-btn]')
      ?.querySelector('button');
    likeButton?.click();
    fixture.detectChanges();

    expect(postSpy.toggleCommentLike).toHaveBeenCalledWith(
      component.comment.id,
      !component.comment.isLikedByMe
    );
  });

  it('should enter editing mode if edit button is pressed', () => {
    expect(component.isEditing).toBeFalse();

    setSpyProperty(loginSpy, 'currentUserEmail', component.comment.user.email);
    fixture.detectChanges();
    rootDiv
      .querySelector('[data-test-edit-btn]')
      ?.querySelector('button')
      ?.click();
    fixture.detectChanges();

    expect(component.isEditing).toBeTrue();
  });

  it('should display comment form component and replace comment message if comment is in editing mode', () => {
    component.isEditing = true;
    fixture.detectChanges();
    const messageElement = rootDiv.querySelector('.message') as HTMLDivElement;
    const commentForm = rootDiv
      .querySelector('.comment-container')
      ?.querySelector('app-comment-form');

    expect(commentForm).toBeTruthy();
    expect(messageElement).toBeFalsy();
  });

  it('should call updateComment and exit editing mode if a message was edited', () => {
    const editedMessage = 'Edited Message';
    component.isEditing = true;
    fixture.detectChanges();
    const commentFormDebugElement = fixture.debugElement.query(
      (e) => e.name === 'app-comment-form'
    );
    const submitButton = commentFormDebugElement.query(
      (e) => e.name === 'button'
    ).nativeElement as HTMLButtonElement;
    const commentFormComponent =
      commentFormDebugElement.componentInstance as CommentFormComponent;

    commentFormComponent.message = editedMessage;
    submitButton.click();
    fixture.detectChanges();

    expect(postSpy.updateComment).toHaveBeenCalledWith(
      component.comment.id,
      editedMessage
    );
    expect(component.isEditing).toBeFalse();
  });

  it('should enter replying mode if reply button is pressed', () => {
    expect(component.isReplying).toBeFalse();

    rootDiv
      .querySelector('[data-test-reply-btn]')
      ?.querySelector('button')
      ?.click();
    fixture.detectChanges();

    expect(component.isReplying).toBeTrue();
  });

  it('should display nested comment form component if comment is in replying mode', () => {
    component.isReplying = true;
    fixture.detectChanges();
    const commentForm = rootDiv.parentElement
      ?.querySelector('.comment-reply-box')
      ?.querySelector('app-comment-form');

    expect(commentForm).toBeTruthy();
  });

  it('should call createComment and exit replying mode if a reply message was sent', () => {
    const replyMessage = 'Reply Message';
    component.isReplying = true;
    fixture.detectChanges();
    const commentFormDebugElement = fixture.debugElement.query(
      (e) => e.name === 'app-comment-form'
    );
    const submitButton = commentFormDebugElement.query(
      (e) => e.name === 'button'
    ).nativeElement as HTMLButtonElement;
    const commentFormComponent =
      commentFormDebugElement.componentInstance as CommentFormComponent;

    commentFormComponent.message = replyMessage;
    submitButton.click();
    fixture.detectChanges();

    expect(postSpy.createComment).toHaveBeenCalledWith(
      replyMessage,
      component.comment.id
    );
    expect(component.isReplying).toBeFalse();
  });

  it('should call deleteComment if delete button is pressed', (done) => {
    setSpyProperty(loginSpy, 'currentUserEmail', component.comment.user.email);
    fixture.detectChanges();
    const deleteButton = rootDiv
      .querySelector('[data-test-delete-btn]')
      ?.querySelector('button');
    deleteButton?.click();
    fixture.detectChanges();
    acceptDeleteConfirmDialogAnd(() => {
      expect(postSpy.deleteComment).toHaveBeenCalledWith(component.comment.id);
      done();
    });
  });
});
