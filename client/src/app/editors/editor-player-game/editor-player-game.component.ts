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
import { PlayerEntity, PlayerGameEntity, ScoreType } from 'libs/index';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { buildForm } from '../../shared/form.utils';

import { ButtonModule } from 'primeng/button';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { CheckboxComponent } from '../../shared/components/checkbox/checkbox.component';
import { NumberInputComponent } from '../../shared/components/number-input/number-input.component';
import { TagsComponent } from '../../shared/components/tags/tags.component';
import { ApiService } from '../../shared/services/api.service';
import { EditorPlayerComponent } from '../editor-player/editor-player.component';
import { AsyncPipe } from '@angular/common';

type EntityType = PlayerGameEntity;

@Component({
  selector: 'app-editor-player-game',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    TooltipModule,
    CheckboxComponent,
    NumberInputComponent,
    TagsComponent,
    EditorPlayerComponent,
    AsyncPipe,
  ],
  templateUrl: './editor-player-game.component.html',
  styleUrl: './editor-player-game.component.scss',
})
export class EditorPlayerGameComponent implements OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    if ('playerGame' in changes && this.playerGame) {
      if (this.playerGame.PlayerGameId === '') {
        this.title = 'Add Player';
        this.isNew = true;
      } else {
        this.title = 'Edit Player';
        this.isNew = false;
      }

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new PlayerGameEntity());
      const instance = new PlayerGameEntity(this.playerGame);
      instance.Tags = [...this.playerGame.Tags];
      this.formGroup.patchValue(instance);

      if (this.scoreType === 'win-lose') {
        this.getControl('Points')?.setValue(this.playerGame.Points === null ? true : this.playerGame.Points === 1);
      } else {
        // Continue
      }
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
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
