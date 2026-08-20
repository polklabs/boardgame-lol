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
import { BoardGameEntity, CopyAttrsMapping, ScoreTypeMapping, TagEntity } from 'libs/index';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { buildForm } from '../../shared/form.utils';

import { ButtonModule } from 'primeng/button';
import { TextInputComponent } from '../../shared/components/form-components/textinput/textinput.component';
import { DropdownComponent } from '../../shared/components/form-components/dropdown/dropdown.component';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { Observable, of, Subscription } from 'rxjs';
import { TagsComponent } from '../../shared/components/form-components/tags/tags.component';
import { NumberInputComponent } from '../../shared/components/form-components/number-input/number-input.component';
import { MultiSelectComponent } from '../../shared/components/form-components/multi-select/multi-select.component';
import { NameValue } from '../../shared/models/name-value.model';
import { format } from 'date-fns';
import { CheckboxComponent } from '../../shared/components/form-components/checkbox/checkbox.component';
import { HideDirective } from '../../shared/directives/hide.directive';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { uniqueValidator } from '../../shared/validators/unique.validator';

type EntityType = BoardGameEntity;

@Component({
  selector: 'app-editor-board-game',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonModule,
    TextInputComponent,
    CheckboxModule,
    DialogModule,
    TooltipModule,
    TagsComponent,
    MultiSelectComponent,
    NumberInputComponent,
    CheckboxComponent,
    HideDirective,
    DialogComponent,
  ],
  templateUrl: './editor-board-game.component.html',
  styleUrl: './editor-board-game.component.scss',
})
export class EditorBoardGameComponent implements OnChanges, OnDestroy {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  @Input() editorVisible = false;
  @Input() boardGame?: BoardGameEntity;
  @Output() closeEditor = new EventEmitter<BoardGameEntity>();
  @Output() deleteEntity = new EventEmitter<BoardGameEntity>();

  title = '';
  isNew = false;

  entityType = BoardGameEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  scoreTypeMapping = ScoreTypeMapping;
  scoreTypes = Object.entries(this.scoreTypeMapping).map(([value, label]) => ({ value, label }));

  playOptions: NameValue[] = [];
  CopyAttrOptions: NameValue[] = Object.entries(CopyAttrsMapping).map(([value, name]) => ({ value, name }));

  tagList$: Observable<TagEntity[]> = of([]);

  subscriptions = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    if ('boardGame' in changes) {
      this.updateEditor();
    } else {
      this.closeEditor.emit();
    }
  }

  updateEditor(): void {
    if (this.boardGame) {
      if (this.boardGame.BoardGameId === '') {
        this.title = 'New BoardGame';
        this.isNew = true;
      } else {
        this.title = 'Edit BoardGame';
        this.isNew = false;
      }

      this.grabLists();

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new BoardGameEntity());
      this.getControl('Name')?.addValidators(uniqueValidator(this.apiService.boardGames, this.formGroup));
      const instance = new BoardGameEntity(this.boardGame);
      instance.Tags = [...this.boardGame.Tags];
      this.formGroup.patchValue(instance);
      this.updatePrefixSuffix();

      if (this.isNew) {
        this.getControl('NewGameRefId')?.disable();
        this.getControl('NewGameRefCopyItems')?.disable();
      } else {
        // Continue
      }

      this.subscriptions.add(
        this.getControl('ScoreType')?.valueChanges.subscribe(() => {
          this.updatePrefixSuffix();
        }),
      );
      this.subscriptions.add(
        this.getControl('ScorePrefix')?.valueChanges.subscribe(() => {
          this.updatePrefixSuffix();
        }),
      );
      this.subscriptions.add(
        this.getControl('ScoreSuffix')?.valueChanges.subscribe(() => {
          this.updatePrefixSuffix();
        }),
      );
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  grabLists() {
    this.tagList$ = this.apiService.tags.raw$;
    this.playOptions = this.apiService.games.raw
      .filter((x) => x.BoardGameId === this.boardGame?.BoardGameId)
      .map((x) => ({ name: `${format(x.DateObj, 'yyyy/MM/dd')} - ${x.PlayerCount} player(s)`, value: x.GameId }));
  }

  updatePrefixSuffix() {
    const score = this.getControl('ScoreType');
    if (score?.value === 'points') {
      this.hideFields.delete('ScorePrefix');
      this.hideFields.delete('ScoreSuffix');
      this.hideFields.delete('ExampleScore');
      this.hideFields.delete('PointAdjustBase');
      this.hideFields.delete('PointAdjustStep');
      this.hideFields.delete('HigherWins');
    } else {
      this.hideFields.add('ScorePrefix');
      this.hideFields.add('ScoreSuffix');
      this.hideFields.add('ExampleScore');
      this.hideFields.add('PointAdjustBase');
      this.hideFields.add('PointAdjustStep');
      this.hideFields.add('HigherWins');
    }
  }

  async submit(close: boolean) {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.boardGame) {
      return;
    } else {
      const boardGameData = this.formGroup.getRawValue();
      if (boardGameData.NewGameRefId) {
        boardGameData.NewGameRefCopy = boardGameData.NewGameRefCopyItems.join('|');
      } else {
        boardGameData.NewGameRefCopy = null;
      }

      const result = await this.apiService.postBoardGame(
        this.boardGame.BoardGameId === '',
        new BoardGameEntity(boardGameData),
      );
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved BoardGame' });
        if (close) {
          this.closeEditor.emit();
        } else {
          this.boardGame = result;
          this.updateEditor();
        }
      } else {
        // Do nothing
      }
    }
  }

  toDeleteEntity() {
    if (this.boardGame?.BoardGameId) {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to proceed?',
        header: 'Deleting BoardGame',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: 'none',
        rejectIcon: 'none',
        rejectButtonStyleClass: 'p-button-text',
        accept: async () => {
          const result = await this.apiService.deleteBoardGame(this.boardGame!.BoardGameId);
          if (result) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted BoardGame' });
            this.closeEditor.emit();
            this.router.navigateByUrl(`/club/${this.apiService.club?.ClubId}`);
          } else {
            // Do nothing
          }
        },
      });
    } else {
      // do nothing
    }
  }
}
