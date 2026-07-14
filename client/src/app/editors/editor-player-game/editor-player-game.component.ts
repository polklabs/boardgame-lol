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
import { isGuid, PlayerEntity, PlayerGameEntity, ScoreType, TagEntity } from 'libs/index';
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
import { Observable, of } from 'rxjs';

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
  @Input() players: PlayerEntity[] = [];
  @Input() scoreType?: ScoreType;

  @Output() closeEditor = new EventEmitter<PlayerGameEntity>();
  @Output() deleteEntity = new EventEmitter<PlayerGameEntity>();

  @Output() editPlayer = new EventEmitter<PlayerEntity | undefined>();

  get selectedPlayer() {
    const id = this.formGroup.controls['PlayerId'].value;
    return this.players.find((x) => x.PlayerId === id);
  }

  title = '';
  isNew = false;

  entityType = PlayerGameEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  tagList$: Observable<TagEntity[]> = of([]);

  ngOnChanges(changes: SimpleChanges): void {
    if ('playerGame' in changes && this.playerGame) {
      if (this.playerGame.PlayerGameId === '') {
        this.title = 'Add Player';
        this.isNew = true;
      } else {
        this.title = 'Edit Player';
        this.isNew = false;
      }

      this.grabLists();

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

  grabLists() {
    this.tagList$ = this.apiService.tagList$;
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
      this.playerGame.Player = this.players.find((x) => x.PlayerId === this.playerGame?.PlayerId) ?? null;
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

  canEditPlayer() {
    const value = this.formGroup.controls['PlayerId'].value;
    if (isGuid(value) || value === '' || value === undefined) {
      return false;
    } else {
      return true;
    }
  }

  playerSaved(player?: PlayerEntity) {
    this.formGroup.controls['PlayerId'].setValue(null);
    if (player) {
      this.formGroup.controls['PlayerId'].setValue(player.PlayerId);
    } else {
      // continue
    }
  }

  playerDeleted(player?: PlayerEntity) {
    const id = this.formGroup.controls['PlayerId'].value;
    if (player?.PlayerId === id) {
      this.formGroup.controls['PlayerId'].setValue(this.players[0]?.PlayerId ?? null);
    } else {
      // continue
    }
  }
}
