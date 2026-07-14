import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TextInputComponent } from '../../shared/components/textinput/textinput.component';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { buildForm } from '../../shared/form.utils';
import { PlayerEntity, TagEntity } from 'libs/index';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../shared/services/api.service';
import { Router } from '@angular/router';
import { CheckboxComponent } from '../../shared/components/checkbox/checkbox.component';
import { TagsComponent } from '../../shared/components/tags/tags.component';
import { Observable, of } from 'rxjs';

type EntityType = PlayerEntity;

@Component({
  selector: 'app-editor-player',
  imports: [
    DialogModule,
    TextInputComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxComponent,
    TagsComponent,
  ],
  templateUrl: './editor-player.component.html',
  styleUrl: './editor-player.component.scss',
})
export class EditorPlayerComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

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

  tagList$: Observable<TagEntity[]> = of([]);

  ngOnChanges(changes: SimpleChanges): void {
    if ('player' in changes && this.player) {
      if (this.player.PlayerId === '') {
        this.title = 'New Player';
        this.isNew = true;
      } else {
        this.title = 'Edit Player';
        this.isNew = false;
      }

      this.grabLists();

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new PlayerEntity());
      const instance = new PlayerEntity(this.player);
      instance.Tags = [...this.player.Tags];
      this.formGroup.patchValue(instance);
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  grabLists() {
    this.tagList$ = this.apiService.tagList$;
  }

  async submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.player) {
      return;
    } else if (this.standalone) {
      const result = await this.apiService.postPlayer(this.player.PlayerId === '', this.formGroup.getRawValue());
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
            this.router.navigateByUrl(`/club/${this.apiService.club?.ClubId}`);
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
