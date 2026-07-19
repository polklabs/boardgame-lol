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
import { BoardGameEntity, ScoreTypeMapping, TagEntity } from 'libs/index';
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
import { Observable, of, Subscription } from 'rxjs';
import { TagsComponent } from '../../shared/components/tags/tags.component';
import { NumberInputComponent } from '../../shared/components/number-input/number-input.component';

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
    NumberInputComponent,
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
      const instance = new BoardGameEntity(this.boardGame);
      instance.Tags = [...this.boardGame.Tags];
      this.formGroup.patchValue(instance);
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

  grabLists() {
    this.tagList$ = this.apiService.tags.raw$;
  }

  updatePrefixSuffix() {
    const score = this.getControl('ScoreType');
    if (score?.value === 'points') {
      this.hideFields.delete('ScorePrefix');
      this.hideFields.delete('ScoreSuffix');
    } else {
      this.hideFields.add('ScorePrefix');
      this.hideFields.add('ScoreSuffix');
    }
  }

  async submit(close: boolean) {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.boardGame) {
      return;
    } else {
      const result = await this.apiService.postBoardGame(
        this.boardGame.BoardGameId === '',
        new BoardGameEntity(this.formGroup.getRawValue()),
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
