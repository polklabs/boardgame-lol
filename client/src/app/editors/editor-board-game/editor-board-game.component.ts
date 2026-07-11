import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { BoardGameEntity, ScoreTypeMapping } from 'libs/index';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { buildForm } from '../../shared/form.utils';

import { ButtonModule } from 'primeng/button';
import { TextInputComponent } from '../../shared/components/textinput/textinput.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { Subscription } from 'rxjs';

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
    TooltipModule
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
  @Input() standalone = true;
  @Output() closeEditor = new EventEmitter<BoardGameEntity>();
  @Output() deleteEntity = new EventEmitter<BoardGameEntity>();

  title = '';
  isNew = false;

  entityType = BoardGameEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  scoreTypeMapping = ScoreTypeMapping;
  scoreTypes = Object.entries(this.scoreTypeMapping).map(([value, label]) => ({ value, label }));

  subscriptions = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    if ('boardGame' in changes && this.boardGame) {
      if (this.boardGame.BoardGameId === null) {
        this.title = 'New BoardGame';
        this.isNew = true;
      } else {
        this.title = 'Edit BoardGame';
        this.isNew = false;
      }

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new BoardGameEntity());
      this.formGroup.patchValue(new BoardGameEntity(this.boardGame));
      this.updatePrefixSuffix();

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

  updatePrefixSuffix() {
    const score = this.getControl('ScoreType');
    if (score?.value === 'points') {
      this.hideFields.delete('ScorePrefix');
      this.hideFields.delete('ScoreSuffix');
      this.hideFields.delete('exampleScore');
    } else {
      this.hideFields.add('ScorePrefix');
      this.hideFields.add('ScoreSuffix');
      this.hideFields.add('exampleScore');
    }
    this.getControl('exampleScore')?.setValue(
      `${this.getControl('ScorePrefix')?.value ?? ''}42${this.getControl('ScoreSuffix')?.value ?? ''}`,
    );
    this.getControl('exampleScore')?.disable();
  }

  async submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.boardGame) {
      return;
    } else if (this.standalone) {
      const result = await this.apiService.postBoardGame(
        this.boardGame.BoardGameId === null,
        this.formGroup.getRawValue(),
      );
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved BoardGame' });
        this.closeEditor.emit();
      } else {
        // Do nothing
      }
    } else {
      Object.assign(this.boardGame, this.formGroup.getRawValue());
      this.closeEditor.emit(this.boardGame);
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
          if (this.standalone) {
            const result = await this.apiService.deleteBoardGame(this.boardGame!.BoardGameId);
            if (result) {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted BoardGame' });
              this.closeEditor.emit();
              this.router.navigateByUrl(`/club/${this.apiService.club?.ClubId}`);
            } else {
              // Do nothing
            }
          } else {
            this.deleteEntity.emit(this.boardGame);
          }
        },
      });
    } else {
      // do nothing
    }
  }
}
