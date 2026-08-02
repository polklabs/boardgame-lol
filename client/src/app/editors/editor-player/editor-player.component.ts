import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TextInputComponent } from '../../shared/components/form-components/textinput/textinput.component';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { buildForm } from '../../shared/form.utils';
import { NameShortening, NameShortenings, PlayerEntity, TagEntity } from 'libs/index';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../shared/services/api.service';
import { Router } from '@angular/router';
import { CheckboxComponent } from '../../shared/components/form-components/checkbox/checkbox.component';
import { TagsComponent } from '../../shared/components/form-components/tags/tags.component';
import { Observable, of, Subscription } from 'rxjs';
import { HideDirective } from '../../shared/directives/hide.directive';
import { DropdownComponent } from '../../shared/components/form-components/dropdown/dropdown.component';

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
    DropdownComponent,
    HideDirective,
  ],
  templateUrl: './editor-player.component.html',
  styleUrl: './editor-player.component.scss',
})
export class EditorPlayerComponent implements OnChanges, OnDestroy {
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

  nameShortenings = NameShortenings.map((x) => ({ label: x, value: x }));
  subtypes: string[] = [];

  tagList$: Observable<TagEntity[]> = of([]);

  subscriptions = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    if ('player' in changes) {
      this.updateEditor();
    } else {
      this.closeEditor.emit();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateEditor(): void {
    if (this.player) {
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

      this.subscriptions.add(
        this.getControl('PreferredName')?.valueChanges.subscribe((value) => {
          this.updatePreferredName(value);
        }),
      );
      this.updatePreferredName(instance.PreferredName);
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  grabLists() {
    this.tagList$ = this.apiService.tags.raw$;
  }

  updatePreferredName(value: NameShortening) {
    if (value === 'custom') {
      this.hideFields.delete('Nickname');
    } else {
      this.hideFields.add('Nickname');
      this.getControl('Nickname')?.setValue(null);
    }
  }

  async submit(close: boolean) {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.player) {
      return;
    } else {
      const result = await this.apiService.postPlayer(
        this.player.PlayerId === '',
        new PlayerEntity(this.formGroup.getRawValue()),
      );
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Player' });

        if (close) {
          this.closeEditor.emit(result);
        } else {
          this.player = result;
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
      header: 'Deleting Player',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        const result = await this.apiService.deletePlayer(this.player!.PlayerId);
        if (result) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted Player' });
          this.closeEditor.emit();
          this.router.navigateByUrl(`/club/${this.apiService.club?.ClubId}`);
        } else {
          // Do nothing
        }
      },
    });
  }
}
