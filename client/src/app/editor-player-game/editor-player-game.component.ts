import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { isGuid, PlayerEntity, PlayerGameEntity, ScoreType } from 'libs/index';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { buildForm } from '../shared/form.utils';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TextInputComponent } from '../shared/components/textinput/textinput.component';
import { DropdownComponent } from '../shared/components/dropdown/dropdown.component';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

type EntityType = PlayerGameEntity;

@Component({
  selector: 'app-editor-player-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonModule,
    TextInputComponent,
    CheckboxModule,
    DialogModule,
    TooltipModule,
  ],
  templateUrl: './editor-player-game.component.html',
  styleUrl: './editor-player-game.component.scss',
})
export class EditorPlayerGameComponent implements OnChanges {
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

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('playerGame' in changes && this.playerGame) {
      if (this.playerGame.PlayerGameId === null) {
        this.title = 'New Winner';
        this.isNew = true;
      } else {
        this.title = 'Edit Winner';
        this.isNew = false;
      }

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new PlayerGameEntity());
      this.formGroup.patchValue(new PlayerGameEntity(this.playerGame));

      if(this.scoreType === 'win-lose') {
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

  async submit() {
    if(this.scoreType === 'win-lose') {
      const won = this.getControl('Points')?.value ?? false;
      this.getControl('Points')?.setValue(won ? 1 : 0);
    } else {
      // Continue
    }
    

    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.playerGame) {
      console.log(this.formGroup.controls);
      return;
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
    if (isGuid(value) || value === null || value === undefined) {
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
