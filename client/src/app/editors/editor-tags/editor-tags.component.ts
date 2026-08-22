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
import { DISPLAY_FIELDS, TagCategory, TagCategoryMapping, TagEntity } from 'libs/index';
import { TextInputComponent } from '../../shared/components/form-components/textinput/textinput.component';
import { ButtonModule } from 'primeng/button';
import { buildForm } from '../../shared/form.utils';
import { TagModule } from 'primeng/tag';
import { CheckboxComponent } from '../../shared/components/form-components/checkbox/checkbox.component';
import { DropdownComponent } from '../../shared/components/form-components/dropdown/dropdown.component';
import { HideDirective } from '../../shared/directives/hide.directive';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { uniqueValidator } from '../../shared/validators/unique.validator';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MultiSelectComponent } from '../../shared/components/form-components/multi-select/multi-select.component';
import { TooltipModule } from 'primeng/tooltip';
import { DetailService } from '../../shared/services/detail.service';
import { ColorSelectComponent } from "../../shared/components/form-components/color-select/color-select.component";

type EntityType = TagEntity;

@Component({
  selector: 'app-editor-tags',
  imports: [
    TagModule,
    TextInputComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxComponent,
    DropdownComponent,
    HideDirective,
    DialogComponent,
    MultiSelectComponent,
    TooltipModule,
    ColorSelectComponent
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
  private detail = inject(DetailService);

  @Input() editorVisible = false;
  @Input() tag?: TagEntity;
  @Input() standalone = true;
  @Output() closeEditor = new EventEmitter<TagEntity>();
  @Output() deleteEntity = new EventEmitter<TagEntity>();

  title = 'Manage Tags';
  isNew = false;
  addTagTag = new TagEntity({ Text: 'Add New', Color: '#334155', BackgroundColor: '#ffffff' });

  categoryTypes = Object.entries(TagCategoryMapping).map(([value, x]) => ({ value, label: `${x.text} - ${x.info}` }));
  boardGames$ = this.apiService.boardGames.raw$;

  entityType = TagEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  bgColor = '';
  usageCount = 0;

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
      if (this.tag.TagId === '') {
        this.title = 'New Tag';
        this.isNew = true;
      } else {
        this.title = 'Edit Tag';
        this.isNew = false;
        this.usageCount = [
          ...this.apiService.tagBoardGames.list.filter((x) => !x.Filter),
          ...this.apiService.tagGames.list,
          ...this.apiService.tagPlayerGames.list,
          ...this.apiService.tagPlayers.list,
        ].filter((x) => x.TagId === this.tag!.TagId).length;
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

  updateCategory(category: TagCategory) {
    DISPLAY_FIELDS.forEach((field) => {
      const control = this.getControl(field);
      control?.setValue(TagCategoryMapping[category][field] === true);
    });
    if ((this.getControl('BoardGameFilter')?.value.length ?? 0) > 0) {
      this.getControl('OnPlayers')?.setValue(false);
    } else {
      // Leave as is
    }
  }

  showTagUsage() {
    if (this.tag) {
      this.detail.showDetail(this.tag);
    } else {
      // Skip
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
