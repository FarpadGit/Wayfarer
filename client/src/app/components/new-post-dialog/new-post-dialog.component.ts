import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconBtnComponent } from '../UI/icon-btn/icon-btn.component';
import { ModalService } from 'ngx-modal-ease';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matRemoveCircle } from '@ng-icons/material-icons/baseline';
import { postType } from '../../types';

@Component({
  selector: 'app-new-post-dialog',
  standalone: true,
  imports: [FormsModule, IconBtnComponent, NgIconComponent],
  templateUrl: './new-post-dialog.component.html',
  styleUrl: './new-post-dialog.component.scss',
  viewProviders: [provideIcons({ matRemoveCircle })],
})
export class NewPostDialogComponent implements AfterViewInit {
  constructor(private modalService: ModalService) {}

  @ViewChild('titleInput') titleInput: ElementRef<HTMLInputElement> | null =
    null;

  newPost: Omit<Required<postType>, 'comments'> = {
    title: '',
    body: '',
    images: [],
  };
  acceptedTypes = ['jpg', 'jpeg', 'png'];
  get fileAccept() {
    return this.acceptedTypes.map((t) => 'image/' + t).join(',');
  }
  maxNumberOfImages = 9;

  handleImageUpload(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files == null) return;

    const imgCount = this.newPost.images.length;
    let newImages: postType['images'] = [];
    let imagePromises: Promise<string>[] = [];
    for (
      let i = 0;
      i < files.length && imgCount + newImages.length < this.maxNumberOfImages;
      i++
    ) {
      if (this.areFileTypesValid(files[i].name, this.acceptedTypes)) {
        newImages.push({
          name: files[i].name,
          url: 'LOADING',
          thumbnail: 'LOADING',
        });
        imagePromises.push(this.readFile(files[i]).catch(() => 'ERROR'));
      }
    }

    this.newPost.images.push(...newImages);

    imagePromises.forEach(async (promise, index) => {
      this.newPost.images[imgCount + index].url = await promise;
    });
  }

  areFileTypesValid(name: string, types: string[]) {
    const nameparts = name.split('.');
    const extension = nameparts[nameparts.length - 1].toLowerCase();
    let valid = false;

    for (let i = 0; i < types.length; i++) {
      if (types[i].toLowerCase() === extension.toLowerCase()) {
        valid = true;
      }
    }

    if (!valid) return false;
    return true;
  }

  // converts File into it's base64 string representation (this can be displayed as an image when assigned to src prop)
  private readFile(file: File) {
    return new Promise<string>((res, rej) => {
      if (
        file.size > 20 * 1024 * 1024 || // size > 20 MB
        !this.areFileTypesValid(file.name, this.acceptedTypes) // file extension not valid
      ) {
        rej(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        res(reader.result?.toString() || '');
      };
      reader.onerror = () => {
        rej(reader);
      };
      reader.readAsDataURL(file);
    });
  }

  handleImageDelete(index: number) {
    this.newPost.images = this.newPost.images.filter((_, i) => i !== index);
  }

  ngAfterViewInit(): void {
    this.titleInput?.nativeElement.focus();
  }

  onSubmit() {
    this.modalService.close(this.newPost);
  }

  dismiss() {
    this.modalService.close(null);
  }
}
