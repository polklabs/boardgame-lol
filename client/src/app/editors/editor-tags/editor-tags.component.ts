import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TagEntity } from 'libs/index';
import { DialogModule } from 'primeng/dialog';
import { TextInputComponent } from '../../shared/components/textinput/textinput.component';
import { ButtonModule } from 'primeng/button';
import { buildForm } from '../../shared/form.utils';
import { AsyncPipe } from '@angular/common';
import { TagModule } from 'primeng/tag';

type EntityType = TagEntity;

@Component({
  selector: 'app-editor-tags',
  imports: [AsyncPipe, TagModule, DialogModule, TextInputComponent, ButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editor-tags.component.html',
  styleUrl: './editor-tags.component.scss',
})
export class EditorTagsComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  @Input() editorVisible = false;
  @Output() closeEditor = new EventEmitter<void>();
  @Output() deleteEntity = new EventEmitter<void>();

  title = 'Manage Tags';
  isNew = false;

  tags$ = this.apiService.tagList$;

  tag?: TagEntity;
  entityType = TagEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  buildForm(tag: TagEntity) {
    this.tag = tag;
    if (this.tag?.TagId === null) {
      this.title = 'New Tag';
      this.isNew = true;
    } else {
      this.title = 'Edit Tag';
      this.isNew = false;
    }

    this.hideFields = new Set();
    this.formGroup = buildForm(this.fb, this.entityType, new TagEntity());
    this.formGroup.patchValue(new TagEntity(this.tag));
    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.tag = undefined;
    this.title = 'Manage Tags';
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  async submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.tag) {
      return;
    } else {
      // const result = await this.apiService.postPlayer(this.tag.TagId === null, this.formGroup.getRawValue());
      // if (result) {
      //   this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Tag' });
      //   this.closeEditor.emit();
      // } else {
      //   // Do nothing
      // }
    }
  }

  toDeleteEntity() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Deleting Tag',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        // const result = await this.apiService.deletePlayer(this.tag!.TagId);
        // if (result) {
        //   this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted Player' });
        //   this.closeEditor.emit();
        //   this.router.navigateByUrl(`/club/${this.apiService.club?.ClubId}`);
        // } else {
        //   // Do nothing
        // }
      },
    });
  }
}
