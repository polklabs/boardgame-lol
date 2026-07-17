import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TextInputComponent } from '../../shared/components/textinput/textinput.component';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClubEntity, getAccessibleBackground } from 'libs/index';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { buildForm } from '../../shared/form.utils';
import { UserService } from '../../shared/services/user.service';
import { Observable, of } from 'rxjs';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import { CheckboxComponent } from '../../shared/components/checkbox/checkbox.component';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { ClubTitleComponent } from '../../shared/components/club-title/club-title.component';

type EntityType = ClubEntity;

@Component({
  selector: 'app-editor-club',
  imports: [
    CommonModule,
    DialogModule,
    TextInputComponent,
    TextareaComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxComponent,
    ColorPickerModule,
    DropdownComponent,
    ClubTitleComponent,
  ],
  templateUrl: './editor-club.component.html',
  styleUrl: './editor-club.component.scss',
})
export class EditorClubComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  @Input() editorVisible = false;
  @Input() club?: ClubEntity;
  @Output() closeEditor = new EventEmitter<ClubEntity>();
  @Output() deleteEntity = new EventEmitter<ClubEntity>();

  presetColors: { severity: ButtonSeverity; color: string | null; text: string }[] = [
    { severity: 'contrast', color: null, text: 'Default (White)' },
    { severity: 'secondary', color: '#ffffff', text: 'Black' },
    { severity: 'success', color: '#156934', text: 'Green' },
    { severity: 'info', color: '#0e5780', text: 'Blue' },
    { severity: 'warn', color: '#C2410C', text: 'Orange' },
    { severity: 'help', color: '#380b61', text: 'Purple' },
    { severity: 'danger', color: '#B91C1C', text: 'Red' },
  ];

  presetFonts: string[] = [
    'Arial, sans-serif',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif',
    'Times New Roman, serif',
    'Georgia, serif',
    'Garamond, serif',
    'Courier New, monospace',
  ];

  bgColor = '';

  title = '';
  isNew = false;

  entityType = ClubEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  adminIds: Observable<string[]> = of([]);

  constructor() {
    this.adminIds = this.userService.adminIds$;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('club' in changes && this.club) {
      if (this.club.ClubId === '') {
        this.title = 'New Club';
        this.isNew = true;
      } else {
        this.title = 'Edit Club';
        this.isNew = false;
      }

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new ClubEntity());
      this.formGroup.patchValue(new ClubEntity(this.club));
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
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
    if (control?.value) {
      this.bgColor = getAccessibleBackground(control?.value);
    } else {
      this.bgColor = '';
    }
  }

  async submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.club) {
      return;
    } else {
      const result = await this.apiService.postClub(
        this.club.ClubId === '',
        new ClubEntity(this.formGroup.getRawValue()),
      );
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Club' });
        this.closeEditor.emit();
      } else {
        // Do nothing
      }
    }
  }

  toDeleteEntity() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Deleting Club',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        const result = await this.apiService.deleteClub(this.club!.ClubId);
        if (result) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted Club' });
          this.closeEditor.emit();
          this.router.navigateByUrl(`/home`);
        } else {
          // Do nothing
        }
      },
    });
  }
}
