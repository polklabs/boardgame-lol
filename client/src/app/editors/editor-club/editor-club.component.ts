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
import { TextInputComponent } from '../../shared/components/form-components/textinput/textinput.component';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClubEntity, ClubUserEntity, getAccessibleBackground } from 'libs/index';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { buildForm } from '../../shared/form.utils';
import { TextareaComponent } from '../../shared/components/form-components/textarea/textarea.component';
import { CheckboxComponent } from '../../shared/components/form-components/checkbox/checkbox.component';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DropdownComponent } from '../../shared/components/form-components/dropdown/dropdown.component';
import { ClubTitleComponent } from '../../shared/components/club-title/club-title.component';
import { HideDirective } from '../../shared/directives/hide.directive';
import { UserService } from '../../shared/services/user.service';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogComponent } from "../../shared/components/dialog/dialog.component";

type EntityType = ClubEntity;

@Component({
  selector: 'app-editor-club',
  imports: [
    CommonModule,
    TextInputComponent,
    TextareaComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxComponent,
    ColorPickerModule,
    DropdownComponent,
    ClubTitleComponent,
    HideDirective,
    TableModule,
    InputTextModule,
    CheckboxModule,
    DialogComponent
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

  admin = false;
  userId = this.userService.userId;
  users: ClubUserEntity[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if ('club' in changes) {
      this.updateEditor();
    } else {
      this.closeEditor.emit();
    }
  }

  updateEditor(): void {
    if (this.club) {
      if (this.club.ClubId === '') {
        this.title = 'New Club';
        this.isNew = true;
      } else {
        this.title = 'Edit Club';
        this.isNew = false;
      }

      this.admin = this.club.Admin;

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new ClubEntity());
      this.formGroup.patchValue(new ClubEntity(this.club));

      this.users = this.club.Users.toSorted((a, b) => a.usernameEmail.localeCompare(b.usernameEmail));
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

  async submit(close: boolean) {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.club) {
      return;
    } else {
      const club = new ClubEntity(this.formGroup.getRawValue());
      club.Users = this.users.map((x) => new ClubUserEntity(x)).filter(x => !x.toDelete && !x.UserId);

      const result = await this.apiService.postClub(this.club.ClubId === '', club);
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Club' });

        if (close) {
          this.closeEditor.emit();
        } else {
          this.club = result;
          this.updateEditor();
        }
      } else {
        // Do nothing
      }
    }
  }

  toDeleteEntity() {
    this.confirmationService.confirm({
      message: 'This will delete everything related to this club and cannot be undone. Are you sure that you want to proceed?',
      header: 'Deleting Club',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        const result = await this.apiService.deleteClub();
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

  addUser() {
    this.users.push(new ClubUserEntity({ ClubId: this.club?.ClubId, Admin: false }));
    console.log(this.users.at(-1));
  }
}
