import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BoardGameEntity, ScoreType } from 'libs/index';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { buildForm } from '../shared/form.utils';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TextInputComponent } from '../shared/components/textinput/textinput.component';
import { DropdownComponent } from '../shared/components/dropdown/dropdown.component';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

type EntityType = BoardGameEntity;

@Component({
  selector: 'app-editor-board-game',
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
  templateUrl: './editor-board-game.component.html',
  styleUrl: './editor-board-game.component.scss',
})
export class EditorBoardGameComponent implements OnChanges {
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

  scoreTypeMapping: Record<ScoreType, string> = {
    points: 'Points',
    rank: 'Ranked',
    'win-lose': 'Win/Lose',
  };
  scoreTypes = Object.entries(this.scoreTypeMapping).map(([value, label]) => ({ value, label }));

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

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
    if (this.formGroup.invalid || !this.boardGame) {
      return;
    } else {
      if (this.standalone) {
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
              this.router.navigateByUrl(`/club/${this.apiService.club}`);
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
