import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { CommentListComponent } from './comment-list.component';
import { PostService } from '../../services/post.service';
import { LoginService } from '../../services/login.service';
import { CommentComponent } from '../comment/comment.component';
import { mockComment, mockComment_child } from '../../../test/mocks';

describe('CommentListComponent', () => {
  let component: CommentListComponent;
  let fixture: ComponentFixture<CommentListComponent>;
  let postSpy: jasmine.SpyObj<PostService>;
  let loginSpy: jasmine.SpyObj<LoginService>;

  const mockCommentStack = [
    { ...mockComment, id: 'fakeComment1ID' },
    { ...mockComment, id: 'fakeComment2ID' },
    { ...mockComment, id: 'fakeComment3ID' },
    { ...mockComment, id: 'fakeComment4ID' },
  ];

  beforeEach(async () => {
    postSpy = jasmine.createSpyObj('PostService', ['getReplies']);
    loginSpy = jasmine.createSpyObj('LoginService', [], {
      currentUserEmail: '',
    });

    postSpy.getReplies.withArgs(mockCommentStack[0].id).and.returnValue([
      { ...mockComment_child, id: 'fakeChildComment1ID' },
      { ...mockComment_child, id: 'fakeChildComment2ID' },
    ]);
    postSpy.getReplies
      .withArgs(mockCommentStack[1].id)
      .and.returnValue([{ ...mockComment_child, id: 'fakeChildComment3ID' }]);
    postSpy.getReplies.withArgs(mockCommentStack[2].id).and.returnValue([]);
    postSpy.getReplies.withArgs(mockCommentStack[3].id).and.returnValue([]);
    postSpy.getReplies.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [CommentListComponent],
      providers: [
        { provide: PostService, useValue: postSpy },
        { provide: LoginService, useValue: loginSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;
    component.comments = mockCommentStack;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display each comment in a component', () => {
    const commentElements = fixture.debugElement.queryAll(
      (e) => e.name === 'app-comment'
    );

    // counts component.comments + all of their children by calling the mock function that sets those children
    // this will always return the correct number of mock comments we set in advance
    const parentsWithChildrenCount = component.comments.reduce(
      (sum, e) => sum + 1 + component.getChildComments(e.id).length,
      0
    );

    expect(commentElements.length).toBe(parentsWithChildrenCount);
  });

  it('should display child comments nested under the parent', () => {
    const rootCommentIDs = component.comments.map((comment) => comment.id);
    const commentElements = fixture.debugElement.queryAll(
      (e) => e.name === 'app-comment'
    );
    const rootCommentElements = commentElements.filter((comment) => {
      const commentComponent = comment.componentInstance as CommentComponent;
      return rootCommentIDs.includes(commentComponent.comment.id);
    });
    const nestedStackElements = rootCommentElements.map((comment) =>
      comment.parent?.nativeElement.querySelectorAll('.comment-stack')
    );

    expect(nestedStackElements[0].length).toBe(
      postSpy.getReplies(component.comments[0].id).length
    );
    expect(nestedStackElements[1].length).toBe(
      postSpy.getReplies(component.comments[1].id).length
    );
    expect(nestedStackElements[2].length).toBe(
      postSpy.getReplies(component.comments[2].id).length
    );
    expect(nestedStackElements[3].length).toBe(
      postSpy.getReplies(component.comments[3].id).length
    );
  });

  it('should hide child comments if collapse button is clicked', () => {
    expect(component.areChildrenHidden.every((e) => e === false)).toBeTrue();

    const nestedCommentElements = fixture.debugElement.queryAll(
      (e) => e.classes['nested-comments-stack'] === true
    );
    const collapseButton = nestedCommentElements[0].nativeElement.querySelector(
      'button'
    ) as HTMLButtonElement;

    collapseButton.click();
    fixture.detectChanges();

    expect(component.areChildrenHidden[0]).toBeTrue();
    expect(component.areChildrenHidden[1]).toBeFalse();
    expect(component.areChildrenHidden[2]).toBeFalse();
    expect(component.areChildrenHidden[3]).toBeFalse();
  });
});
