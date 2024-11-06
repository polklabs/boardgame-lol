import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TextInputComponent } from '../shared/components/textinput/textinput.component';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ClubEntity } from 'libs/index';
import { ApiService } from '../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { buildForm } from '../shared/form.utils';
import { UserService } from '../shared/services/user.service';
import { Observable, of } from 'rxjs';
import { TextareaComponent } from '../shared/components/textarea/textarea.component';

type EntityType = ClubEntity;

@Component({
  selector: 'app-editor-club',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TextInputComponent,
    TextareaComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
  ],
  templateUrl: './editor-club.component.html',
  styleUrl: './editor-club.component.scss',
})
export class EditorClubComponent implements OnChanges {
  @Input() editorVisible = false;
  @Input() club?: ClubEntity;
  @Output() closeEditor = new EventEmitter<ClubEntity>();
  @Output() deleteEntity = new EventEmitter<ClubEntity>();

  title = '';
  isNew = false;

  entityType = ClubEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  adminIds: Observable<string[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.adminIds = this.userService.adminIds$;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('club' in changes && this.club) {
      if (this.club.ClubId === null) {
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

  async submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.club) {
      return;
    } else {
      const result = await this.apiService.postClub(this.club.ClubId === null, this.formGroup.getRawValue());
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
