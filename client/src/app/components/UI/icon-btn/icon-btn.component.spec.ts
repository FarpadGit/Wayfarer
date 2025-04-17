import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { IconBtnComponent } from './icon-btn.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerEraser } from '@ng-icons/tabler-icons';

describe('IconBtnComponent', () => {
  describe('With content', () => {
    @Component({
      selector: 'test-component',
      imports: [IconBtnComponent, NgIconComponent],
      template: `
        <app-icon-btn [loading]="loading" [disabled]="disabled">
          <ng-icon icon name="tablerEraser"></ng-icon>
          {{ text }}
        </app-icon-btn>
      `,
      styles: '',
      viewProviders: [
        provideIcons({
          tablerEraser,
        }),
      ],
    })
    class TestComponentWithContent {
      @Input() text = 'some test text';
      @Input() loading = false;
      @Input() disabled = false;
    }

    let component: TestComponentWithContent;
    let fixture: ComponentFixture<TestComponentWithContent>;
    let iconButton: IconBtnComponent;
    let rootButton: HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestComponentWithContent],
        providers: [],
      }).compileComponents();

      fixture = TestBed.createComponent(TestComponentWithContent);
      component = fixture.componentInstance;
      component.loading = false;
      component.disabled = false;
      iconButton = fixture.debugElement.query(
        (e) => e.name === 'app-icon-btn'
      ).componentInstance;
      rootButton = fixture.debugElement
        .query((e) => e.name === 'app-icon-btn')
        .nativeElement.querySelector('button');
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display icon and text content inside component', () => {
      const iconElement = rootButton.querySelector('[icon]');
      const loaderElement = rootButton.querySelector('.spinner');

      expect(rootButton.innerText.includes(component.text)).toBeTrue();
      expect(iconElement).toBeTruthy();
      expect(loaderElement).toBeFalsy();
    });

    it('should display loader if in loading state', () => {
      component.loading = true;
      fixture.detectChanges();
      const iconElement = rootButton.querySelector('[icon]');
      const loaderElement = rootButton.querySelector('.spinner');

      expect(iconElement).toBeFalsy();
      expect(loaderElement).toBeTruthy();
    });

    it('should emit event if clicked', (done) => {
      iconButton.onClick.subscribe((e) => {
        expect(e).toBeFalsy();
        done();
      });

      rootButton.click();
    });

    it('should disable button when "disabled" input is true', () => {
      component.disabled = true;
      fixture.detectChanges();

      expect(rootButton.disabled).toBeTrue();
    });
  });

  describe('Without content', () => {
    let component: IconBtnComponent;
    let fixture: ComponentFixture<IconBtnComponent>;
    let rootButton: HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [IconBtnComponent],
        providers: [],
      }).compileComponents();

      fixture = TestBed.createComponent(IconBtnComponent);
      component = fixture.componentInstance;
      rootButton = fixture.debugElement.nativeElement.querySelector('button');
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should emit event if clicked', (done) => {
      component.onClick.subscribe((e) => {
        expect(e).toBeFalsy();
        done();
      });

      rootButton.click();
    });

    it('should disable button when "disabled" input is true', () => {
      component.disabled = true;
      fixture.detectChanges();

      expect(rootButton.disabled).toBeTrue();
    });
  });
});
