import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { getAccessibleBackground, TagEntity } from 'libs/index';
import { DialogModule } from 'primeng/dialog';
import { TextInputComponent } from '../../shared/components/textinput/textinput.component';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { buildForm } from '../../shared/form.utils';
import { AsyncPipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TagComponent } from '../../shared/components/tag/tag.component';

type EntityType = TagEntity;

@Component({
  selector: 'app-editor-tags',
  imports: [
    AsyncPipe,
    TagModule,
    ColorPickerModule,
    DialogModule,
    TextInputComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TagComponent,
  ],
  templateUrl: './editor-tags.component.html',
  styleUrl: './editor-tags.component.scss',
})
export class EditorTagsComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  @Input() editorVisible = false;
  @Output() closeEditor = new EventEmitter<void>();
  @Output() deleteEntity = new EventEmitter<void>();

  presetColors: { severity: ButtonSeverity; color: string | null; text: string }[] = [
    { severity: 'contrast', color: null, text: 'Default (White)' },
    { severity: 'secondary', color: '#ffffff', text: 'Black' },
    { severity: 'success', color: '#156934', text: 'Green' },
    { severity: 'info', color: '#0e5780', text: 'Blue' },
    { severity: 'warn', color: '#C2410C', text: 'Orange' },
    { severity: 'help', color: '#380b61', text: 'Purple' },
    { severity: 'danger', color: '#B91C1C', text: 'Red' },
  ];

  title = 'Manage Tags';
  isNew = false;
  addTagTag = new TagEntity({ Text: 'Add New', Color: '#334155', BackgroundColor: '#ffffff' });

  tags$ = this.apiService.tagList$;

  tag?: TagEntity;
  entityType = TagEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  bgColor = '';

  editTag(tag: TagEntity) {
    this.buildForm(tag);
  }

  newTag() {
    this.buildForm(new TagEntity({ ClubId: this.apiService.clubId, Text: 'Example' }));
  }

  buildForm(tag: TagEntity) {
    this.tag = tag;
    if (this.tag?.TagId === '') {
      this.title = 'New Tag';
      this.isNew = true;
    } else {
      this.title = 'Edit Tag';
      this.isNew = false;
    }

    this.hideFields = new Set();
    this.formGroup = buildForm(this.fb, this.entityType, new TagEntity());

    // this.getControl('Color')?.addValidators(Validators.pattern(/^#[0-9a-fA-F]{6}$/).bind(this));

    this.formGroup.patchValue(new TagEntity(this.tag));

    this.updateColor();

    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.tag = undefined;
    this.title = 'Manage Tags';
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  setColor(color: string | object | null) {
    console.log('setColor', color);
    const control = this.getControl('Color');
    control?.setValue(color);
    control?.markAsTouched();
    control?.markAsDirty();
    control?.updateValueAndValidity();
    this.updateColor();
  }

  updateColor() {
    const control = this.getControl('Color');
    if (control?.valid) {
      this.bgColor = getAccessibleBackground(control?.value);
    } else {
      this.bgColor = '';
    }
  }

  async submit() {
    console.log(this.formGroup.getRawValue());
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.tag) {
      return;
    } else {
      const result = await this.apiService.postTag(this.tag.TagId === '', this.formGroup.getRawValue());
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Tag' });
        this.tag = undefined;
        this.title = 'Manage Tags';
      } else {
        // Do nothing
      }
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
        const result = await this.apiService.deleteTag(this.tag!.TagId);
        if (result) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted Tag' });
          this.tag = undefined;
          this.title = 'Manage Tags';
        } else {
          // Do nothing
        }
      },
    });
  }
}
