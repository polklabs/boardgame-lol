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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { TextInputComponent } from '../../shared/components/textinput/textinput.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';

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
    DropdownComponent,
    TextInputComponent,
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

  tagList$ = this.apiService.tags.raw$;
  playerList$ = this.apiService.players.raw$;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  pointValidator = Validators.required.bind(this);

  playerEditorVisible = false;
  playerEdit?: PlayerEntity;

  subscriptions = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    if ('playerGame' in changes && this.playerGame) {
      if (this.playerGame.PlayerGameId === '') {
        this.isNew = true;
      } else {
        this.isNew = false;
      }

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new PlayerGameEntity());
      const instance = new PlayerGameEntity(this.playerGame);
      instance.Players = [...this.playerGame.Players];
      this.formGroup.patchValue(instance);
      this.setTitle();

      this.updateTeamName(instance.Team);
      this.updateNonScoring(instance.ScoringPlayer);

      this.subscriptions.add(
        this.getControl('Team')?.valueChanges.subscribe((value) => {
          this.setTitle();
          this.updateTeamName(value);
        }),
      );
      this.subscriptions.add(
        this.getControl('ScoringPlayer')?.valueChanges.subscribe((value) => {
          this.updateNonScoring(value);
        }),
      );
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  updateNonScoring(scoring: boolean) {
    const points = this.getValue('Points');
    if (scoring && points === null) {
      if (this.scoreType === 'win-lose') {
        this.getControl('Points')?.setValue(false);
      } else if (this.scoreType === 'points' || this.scoreType === 'rank') {
        this.getControl('Points')?.setValue(0);
      } else {
        // Non Player
      }
    } else if (!scoring && points !== null) {
      this.getControl('Points')?.setValue(null);
    } else {
      // Continue
    }

    if (scoring) {
      this.getControl('Points')?.addValidators(this.pointValidator);
      this.hideFields.delete('Points');
    } else {
      this.getControl('Points')?.removeValidators(this.pointValidator);
      this.hideFields.add('Points');
    }
    this.getControl('Points')?.updateValueAndValidity();
  }

  updateTeamName(team: boolean) {
    const players = this.getValue('Players');
    if (team) {
      this.getControl('Players')?.setValue(Array.isArray(players) ? players : [players]);
      this.hideFields.delete('Name');
    } else {
      this.getControl('Players')?.setValue(Array.isArray(players) ? players.at(0) ?? null : players);
      this.getControl('Name')?.setValue(null);
      this.hideFields.add('Name');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  getValue(key: keyof EntityType) {
    return this.getControl(key)?.value;
  }

  setTitle() {
    this.title = `${this.playerGame?.PlayerGameId === '' ? 'Add' : 'Edit'} ${this.getValue('Team') ? 'Team Score' : 'Score'}`;
  }

  addPlayer() {
    this.playerEdit = new PlayerEntity({ PlayerId: '', ClubId: this.apiService.clubId });
    this.playerEditorVisible = true;
  }

  async submit() {
    if (this.scoreType === 'win-lose') {
      const won = this.getControl('Points')?.value;
      if (won === true) {
        this.getControl('Points')?.setValue(1);
      } else if (won === false) {
        this.getControl('Points')?.setValue(0);
      } else {
        this.getControl('Points')?.setValue(null);
      }
    } else {
      // Continue
    }

    const toReturn = this.formGroup.getRawValue();
    if (toReturn.Team) {
      // Continue
    } else {
      toReturn.Players = [toReturn.Players];
    }

    this.formGroup.markAllAsTouched();
    this.formGroup.updateValueAndValidity();
    if (this.formGroup.invalid || !this.playerGame) {
      console.log(this.formGroup.controls);
    } else {
      Object.assign(this.playerGame, toReturn);
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
