import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DISPLAY_FIELDS, getAccessibleBackground, TagCategory, TagCategoryMapping, TagEntity } from 'libs/index';
import { TextInputComponent } from '../../shared/components/form-components/textinput/textinput.component';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { buildForm } from '../../shared/form.utils';
import { NgStyle } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ColorPickerModule } from 'primeng/colorpicker';
import { CheckboxComponent } from '../../shared/components/form-components/checkbox/checkbox.component';
import { FieldsetModule } from 'primeng/fieldset';
import { DropdownComponent } from '../../shared/components/form-components/dropdown/dropdown.component';
import { HideDirective } from '../../shared/directives/hide.directive';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { uniqueValidator } from '../../shared/validators/unique.validator';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MultiSelectComponent } from '../../shared/components/form-components/multi-select/multi-select.component';

type EntityType = TagEntity;

@Component({
  selector: 'app-editor-tags',
  imports: [
    TagModule,
    ColorPickerModule,
    TextInputComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxComponent,
    FieldsetModule,
    DropdownComponent,
    HideDirective,
    DialogComponent,
    NgStyle,
    MultiSelectComponent,
  ],
  templateUrl: './editor-tags.component.html',
  styleUrl: './editor-tags.component.scss',
})
export class EditorTagsComponent implements OnDestroy, OnChanges {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  @Input() editorVisible = false;
  @Input() tag?: TagEntity;
  @Input() standalone = true;
  @Output() closeEditor = new EventEmitter<TagEntity>();
  @Output() deleteEntity = new EventEmitter<TagEntity>();

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

  categoryTypes = Object.entries(TagCategoryMapping).map(([value, x]) => ({ value, label: x.text }));
  boardGames$ = this.apiService.boardGames.raw$;

  entityType = TagEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  bgColor = '';

  subscriptions = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    if ('tag' in changes) {
      this.updateEditor();
    } else {
      this.closeEditor.emit();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateEditor() {
    if (this.tag) {
      if (this.tag?.TagId === '') {
        this.title = 'New Tag';
        this.isNew = true;
      } else {
        this.title = 'Edit Tag';
        this.isNew = false;
      }

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new TagEntity());
      this.getControl('Text')?.addValidators(uniqueValidator(this.apiService.tags, this.formGroup));

      const instance = new TagEntity(this.tag);
      instance.BoardGameFilter = this.tag.BoardGameFilter;
      this.formGroup.patchValue(instance);

      this.subscriptions.add(
        this.getControl('Category')?.valueChanges.subscribe((value) => {
          this.updateCategory(value);
        }),
      );

      this.updateColor();
      this.updateCategory(instance.Category);
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.tag = undefined;
    this.title = 'Manage Tags';
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  updateCategory(category: TagCategory | null) {
    DISPLAY_FIELDS.forEach((field) => {
      const control = this.getControl(field);
      control?.setValue(TagCategoryMapping[category ?? ''][field] === true);
      control?.disable();
    });
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

  async submit(close: boolean) {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.tag) {
      return;
    } else {
      const result = await this.apiService.postTag(this.tag.TagId === '', new TagEntity(this.formGroup.getRawValue()));
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Tag' });
        if (close) {
          this.closeEditor.emit(result);
        } else {
          this.tag = result;
          this.updateEditor();
        }
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
          this.closeEditor.emit();
          this.router.navigateByUrl(`/club/${this.apiService.club?.ClubId}`);
        } else {
          // Do nothing
        }
      },
    });
  }
}
