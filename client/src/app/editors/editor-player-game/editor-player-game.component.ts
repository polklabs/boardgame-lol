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
import { PlayerEntity, PlayerGameEntity, ScoreType } from 'libs/index';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { buildForm } from '../../shared/form.utils';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { CheckboxComponent } from '../../shared/components/checkbox/checkbox.component';
import { NumberInputComponent } from '../../shared/components/number-input/number-input.component';
import { TagsComponent } from '../../shared/components/tags/tags.component';
import { ApiService } from '../../shared/services/api.service';
import { EditorPlayerComponent } from '../editor-player/editor-player.component';
import { MultiSelectComponent } from '../../shared/components/multi-select/multi-select.component';
import { Subscription } from 'rxjs';

type EntityType = PlayerGameEntity;

@Component({
  selector: 'app-editor-player-game',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    TooltipModule,
    CheckboxComponent,
    NumberInputComponent,
    TagsComponent,
    EditorPlayerComponent,
    MultiSelectComponent,
  ],
  templateUrl: './editor-player-game.component.html',
  styleUrl: './editor-player-game.component.scss',
})
export class EditorPlayerGameComponent implements OnChanges, OnDestroy {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  @Input() editorVisible = false;
  @Input() playerGame?: PlayerGameEntity;
  @Input() scoreType?: ScoreType;

  @Output() closeEditor = new EventEmitter<PlayerGameEntity>();
  @Output() deleteEntity = new EventEmitter<PlayerGameEntity>();

  title = '';
  isNew = false;

  entityType = PlayerGameEntity;

  tagList$ = this.apiService.tagList$;
  playerList$ = this.apiService.playerList$;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  playerEditorVisible = false;
  playerEdit?: PlayerEntity;

  subscription?: Subscription;

  ngOnChanges(changes: SimpleChanges): void {
    if ('playerGame' in changes && this.playerGame) {
      if (this.playerGame.PlayerGameId === '') {
        this.isNew = true;
      } else {
        this.isNew = false;
      }
      this.setTitle();

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new PlayerGameEntity());
      const instance = new PlayerGameEntity(this.playerGame);
      instance.Players = [...this.playerGame.Players];
      this.formGroup.patchValue(instance);

      if (this.scoreType === 'win-lose') {
        this.getControl('Points')?.setValue(this.playerGame.Points === null ? true : this.playerGame.Points === 1);
      } else {
        // Continue
      }

      this.subscription = this.getControl('Players')?.valueChanges.subscribe(() => {
        this.setTitle();
      });
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  setTitle() {
    this.title = `${this.playerGame?.PlayerGameId === '' ? 'Add' : 'Edit'} ${(this.playerGame?.Players.length ?? 0) > 1 ? 'Team' : 'Player'}`;
  }

  addPlayer() {
    this.playerEdit = new PlayerEntity({ PlayerId: '', ClubId: this.apiService.clubId });
    this.playerEditorVisible = true;
  }

  async submit() {
    if (this.scoreType === 'win-lose') {
      const won = this.getControl('Points')?.value ?? false;
      this.getControl('Points')?.setValue(won ? 1 : 0);
    } else {
      // Continue
    }

    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.playerGame) {
      console.log(this.formGroup.controls);
    } else {
      Object.assign(this.playerGame, this.formGroup.getRawValue());
      this.closeEditor.emit(this.playerGame);
    }
  }

  toDeleteEntity() {
    if (this.playerGame?.PlayerGameId) {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to proceed?',
        header: 'Deleting PlayerGame',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: 'none',
        rejectIcon: 'none',
        rejectButtonStyleClass: 'p-button-text',
        accept: async () => {
          this.deleteEntity.emit(this.playerGame);
        },
      });
    } else {
      // do nothing
    }
  }
}
