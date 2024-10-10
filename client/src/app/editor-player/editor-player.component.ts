import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TextInputComponent } from '../shared/components/textinput/textinput.component';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { buildForm } from '../shared/form.utils';
import { PlayerEntity } from 'libs/index';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ApiService } from '../shared/services/api.service';
import { Router } from '@angular/router';

type EntityType = PlayerEntity;

@Component({
  selector: 'app-editor-player',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TextInputComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
  ],
  templateUrl: './editor-player.component.html',
  styleUrl: './editor-player.component.scss',
})
export class EditorPlayerComponent implements OnChanges {
  @Input() editorVisible = false;
  @Input() player?: PlayerEntity;
  @Input() standalone = true;
  @Output() closeEditor = new EventEmitter<PlayerEntity>();
  @Output() deleteEntity = new EventEmitter<PlayerEntity>();

  title = '';
  isNew = false;

  entityType = PlayerEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  subtypes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('player' in changes && this.player) {
      if (this.player.PlayerId === null) {
        this.title = 'New Player';
        this.isNew = true;
      } else {
        this.title = 'Edit Player';
        this.isNew = false;
      }

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new PlayerEntity());
      this.formGroup.patchValue(this.player);
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
    if (this.formGroup.invalid || !this.player) {
      return;
    } else {
      if (this.standalone) {
        const result = await this.apiService.postPlayer(this.player.PlayerId === null, this.formGroup.getRawValue());
        if (result) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Player' });
          this.closeEditor.emit();
        } else {
          // Do nothing
        }
      } else {
        Object.assign(this.player, this.formGroup.getRawValue());
        this.closeEditor.emit(this.player);
      }
    }
  }

  toDeleteEntity() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Deleting Player',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        if (this.standalone) {
          const result = await this.apiService.deletePlayer(this.player!.PlayerId);
          if (result) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted Player' });
            this.closeEditor.emit();
            this.router.navigateByUrl(`/club/${this.apiService.club}`);
          } else {
            // Do nothing
          }
        } else {
          this.deleteEntity.emit(this.player);
        }
      },
    });
  }
}
