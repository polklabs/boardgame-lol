import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BoardGameEntity, GameEntity, getMinMax, PlayerGameEntity } from 'libs/index';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { buildForm } from '../../shared/form.utils';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { OrderListModule } from 'primeng/orderlist';
import { ButtonModule } from 'primeng/button';
import { EditorBoardGameComponent } from '../editor-board-game/editor-board-game.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { EditorPlayerGameComponent } from '../editor-player-game/editor-player-game.component';
import { CalendarComponent } from '../../shared/components/calendar/calendar.component';
import { Subscription } from 'rxjs';
import { format } from 'date-fns';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TagsComponent } from '../../shared/components/tags/tags.component';
import { TooltipModule } from 'primeng/tooltip';
import { TagComponent } from '../../shared/components/tag/tag.component';
import { ScorePipe } from '../../shared/pipes/score.pipe';
import { PlayerGamePlayerEntity } from 'libs/models/PlayerGamePlayer.entity';
import { NumberInputComponent } from '../../shared/components/number-input/number-input.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';

type EntityType = GameEntity;

const BUTTON_WIDTH = 44;
const BUTTON_GAP = 4;
const POINT_VALUES = [1, 5, 10, 50, 100, 150, 200];

@Component({
  selector: 'app-editor-game',
  imports: [
    CommonModule,
    DialogModule,
    DropdownComponent,
    TextareaComponent,
    CalendarComponent,
    CheckboxModule,
    InputNumberModule,
    ButtonModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    EditorBoardGameComponent,
    EditorPlayerGameComponent,
    OrderListModule,
    InputGroupAddonModule,
    NumberInputComponent,
    TagsComponent,
    TooltipModule,
    TagComponent,
    ScorePipe,
  ],
  templateUrl: './editor-game.component.html',
  styleUrl: './editor-game.component.scss',
})
export class EditorGameComponent implements OnInit, OnChanges, OnDestroy {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('gameEditDialog', { static: true, read: ElementRef }) gameEditDialog!: ElementRef;
  @ViewChild('addPointGroup', { static: false, read: ElementRef }) pointGroupButtons?: ElementRef;

  @Input() editorVisible = false;
  @Input() game?: GameEntity;
  @Output() closeEditor = new EventEmitter<void>();

  title = 'Edit Play';
  isNew = false;

  entityType = GameEntity;

  tagList$ = this.apiService.tags.raw$;
  boardGameList$ = this.apiService.boardGames.raw$;

  protected selectedPlayerGames: PlayerGameEntity[] = [];

  playerGames: PlayerGameEntity[] = [];

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  playerGameEditorVisible = false;
  playerGameEdit?: PlayerGameEntity;

  boardGameEditorVisible = false;
  boardGameEdit?: BoardGameEntity;

  showCustomPointsDialog = false;
  customPointAdjustment: number | null = null;

  showTiebreaker = false;
  maxPoints = 0;
  maxVirtualPoints = 0;

  pointGroupButtonValues: number[] = [];

  subscription?: Subscription;

  wakeLock?: WakeLockSentinel;

  ngOnInit(): void {
    navigator.wakeLock
      .request()
      .then((lock) => {
        this.wakeLock = lock;
        console.log('Wake lock success');
      })
      .catch(() => console.warn('Wake lock failed'));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('game' in changes) {
      this.updateEditor();
    } else {
      // Skip
    }
  }

  updateEditor(): void {
    if (this.game) {
      this.game = new GameEntity(this.game, true);
      if (this.game.GameId === '') {
        this.title = 'New Play';
        this.isNew = true;
      } else {
        this.title = 'Edit Play';
        this.isNew = false;
      }

      this.grabLists();

      if (this.isNew) {
        const firstBoardGame = this.apiService.boardGames.raw[0];
        const lastBoardGame = this.apiService.games.raw[0]?.BoardGame;
        this.game.BoardGame = lastBoardGame ?? firstBoardGame ?? null;
        this.game.BoardGameId = this.game.BoardGame?.BoardGameId ?? null;
        this.game.Date = new Date();
      } else {
        const date = new Date(this.game.Date);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        this.game.Date = new Date(date.getTime() + userTimezoneOffset);
      }

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new GameEntity());
      this.formGroup.patchValue(new GameEntity(this.game));

      this.subscription = this.getControl('BoardGameId')?.valueChanges.subscribe((value) => {
        this.game!.BoardGame = this.apiService.boardGames.getOne(value);
        this.updateScoring();
      });

      const observer = new ResizeObserver(() => {
        this.calculatePointButtons();
      });
      observer.observe(this.gameEditDialog.nativeElement);
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();

    if (this.wakeLock) {
      this.wakeLock.release();
      console.log('Wake lock released');
    } else {
      // Continue
    }
  }

  grabLists() {
    this.playerGames = this.apiService.playerGames.raw
      .filter((x) => x.GameId === this.game?.GameId)
      .map((m) => new PlayerGameEntity(m, true));
    this.updateScoring();
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  calculatePointButtons() {
    this.pointGroupButtonValues = [];
    if (this.pointGroupButtons) {
      // Continue
    } else {
      return;
    }

    let width = this.pointGroupButtons.nativeElement.clientWidth;
    width -= BUTTON_WIDTH + BUTTON_GAP;

    const count = Math.floor(width / (BUTTON_WIDTH + BUTTON_GAP));
    for (let i = 0; i < count; i++) {
      this.pointGroupButtonValues.push(POINT_VALUES[i] ?? (this.pointGroupButtonValues.at(-1) ?? 0) + 100);
    }
  }

  addPoints(points: number | null) {
    const minMax = getMinMax(PlayerGameEntity)['Points'];
    this.selectedPlayerGames.forEach((p) => {
      p.Points = Math.max(minMax.min ?? -Infinity, Math.min(minMax.max ?? Infinity, (p.Points ?? 0) + (points ?? 0)));
    });
    this.updateScoring();
  }

  setPoints(points: number) {
    const minMax = getMinMax(PlayerGameEntity)['Points'];
    this.selectedPlayerGames.forEach((p) => {
      p.Points = Math.max(minMax.min ?? -Infinity, Math.min(minMax.max ?? Infinity, points));
    });
    this.updateScoring();
  }

  customPoints() {
    this.showCustomPointsDialog = true;
    this.customPointAdjustment = null;
  }

  onPlayerSelection(event: PlayerGameEntity[]) {
    for (const item of event) {
      if (!this.selectedPlayerGames.includes(item)) {
        this.selectedPlayerGames = [item];
        this.calculatePointButtons();
        return;
      } else {
        // Continue
      }
    }
    this.selectedPlayerGames = [];
  }

  updateOrdering() {
    if (this.game?.BoardGame?.ScoreType === 'rank') {
      let DNFs = 0;
      for (let i = 0; i < this.playerGames.length; i++) {
        const pg = this.playerGames[i];
        if (pg.DNF) {
          DNFs += 1;
          pg.Points = null;
        } else {
          pg.Points = i - DNFs;
        }
      }
      this.playerGames.sort((a, b) => (a.Points ?? Infinity) - (b.Points ?? Infinity));
    } else {
      this.playerGames.sort((a, b) => (b.Points ?? 0) - (a.Points ?? 0));
    }
  }

  tieBreak(playerGame: PlayerGameEntity, checked: boolean) {
    this.playerGames.forEach((pg) => {
      if (pg.Points === playerGame.Points) {
        pg.TieBreaker = false;
      } else {
        // Continue
      }
    });
    playerGame.TieBreaker = checked;
    this.updateScoring();
  }

  updateScoring() {
    switch (this.game?.BoardGame?.ScoreType) {
      case 'rank':
        this.updateOrdering();
        break;
      case 'win-lose':
        this.playerGames.forEach((pg) => {
          if ((pg.Points ?? 0) > 0) {
            pg.Points = 1;
          } else {
            pg.Points = 0;
          }
        });
        this.playerGames.sort((a, b) => (b.Points ?? 0) - (a.Points ?? 0));
        break;
      case 'points':
        this.maxPoints = Math.max(...this.playerGames.map((x) => x.Points ?? 0));
        this.maxVirtualPoints = Math.max(...this.playerGames.map((x) => x.VirtualPoints ?? 0));
        this.playerGames.sort((a, b) => (b.VirtualPoints ?? 0) - (a.VirtualPoints ?? 0));
        this.showTiebreaker =
          this.playerGames.reduce((prev, curr) => prev + (curr.Points === this.maxPoints ? 1 : 0), 0) > 1;

        if (this.showTiebreaker) {
          // continue
        } else {
          this.playerGames.forEach((pg) => (pg.TieBreaker = false));
        }
        break;
      default:
        break;
    }
    this.playerGames = [...this.playerGames];
  }

  getTrophyColor(playerGame: PlayerGameEntity): string {
    if (this.game?.BoardGame?.ScoreType === 'rank') {
      if (playerGame.Points === 0) {
        return 'gold';
      } else if (playerGame.Points === 1) {
        return 'silver';
      } else if (playerGame.Points === 2) {
        return 'chocolate';
      } else {
        return '';
      }
    } else {
      return 'gold';
    }
  }

  editPlayerGame(playerGame?: PlayerGameEntity) {
    if (playerGame) {
      this.playerGameEdit = playerGame;
    } else {
      this.playerGameEdit = new PlayerGameEntity({ ClubId: this.game?.ClubId, GameId: '-1' });
      const existingPlayers = new Set(this.playerGames.flatMap((x) => x.Players.map((p) => p.PlayerId)));
      this.playerGameEdit.Players = [this.apiService.players.raw.find((x) => !existingPlayers.has(x.PlayerId))].filter(
        (x) => x !== undefined,
      );
    }
    this.playerGameEditorVisible = true;
  }

  savePlayerGame(pg?: PlayerGameEntity) {
    if (pg) {
      const index = this.playerGames.indexOf(pg);
      if (index === -1) {
        this.playerGames = [...this.playerGames, pg];
      } else {
        // continue
      }

      if (pg.PlayerGameId === '') {
        pg.PlayerLinks = pg.Players.map(
          (p) =>
            new PlayerGamePlayerEntity({
              ClubId: this.apiService.clubId,
              PlayerGameId: pg.PlayerGameId,
              PlayerId: p.PlayerId,
            }),
        );
      } else {
        const linkIds = new Set(pg.PlayerLinks.map((x) => x.PlayerId));
        pg.Players.forEach((p) => {
          if (linkIds.has(p.PlayerId)) {
            // Skip
          } else {
            pg.PlayerLinks.push(
              new PlayerGamePlayerEntity({
                ClubId: this.apiService.clubId,
                PlayerGameId: pg.PlayerGameId,
                PlayerId: p.PlayerId,
              }),
            );
          }
          linkIds.delete(p.PlayerId);
        });
        pg.PlayerLinks = pg.PlayerLinks.filter((x) => !linkIds.has(x.PlayerId)).map(
          (x) => new PlayerGamePlayerEntity(x),
        );
      }

      this.updateScoring();
      this.updatePlayerCount();
    } else {
      // continue
    }
    this.playerGameEdit = undefined;
    this.playerGameEditorVisible = false;
  }

  deletePlayerGame(playerGame?: PlayerGameEntity) {
    if (playerGame) {
      const index = this.playerGames.indexOf(playerGame);
      if (index === -1) {
        // continue
      } else {
        this.playerGames.splice(index, 1);
        this.playerGames = [...this.playerGames];
      }
    } else {
      // continue
    }

    this.playerGameEdit = undefined;
    this.playerGameEditorVisible = false;
    this.selectedPlayerGames = [];
    this.updateScoring();
    this.updatePlayerCount();
  }

  addBoardGame() {
    this.boardGameEdit = new BoardGameEntity({ BoardGameId: '', ClubId: this.game?.ClubId });
    this.boardGameEditorVisible = true;
  }

  updatePlayerCount() {
    if (this.getControl('Players')?.disabled) {
      this.getControl('Players')?.setValue(this.playerGames.reduce((prev, curr) => prev + curr.Players.length, 0));
    } else {
      // Skip
    }
  }

  async submit(close: boolean) {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.game) {
      return;
    } else {
      const gameData = this.formGroup.getRawValue();
      gameData.Date = format(gameData.Date, 'yyyy-MM-dd');
      const oldDate = format(this.game.Date, 'yyyy-MM-dd');

      if (this.isNew || oldDate !== gameData.Date) {
        gameData.SortIndex = this.apiService.games.raw
          .filter((x) => x.Date === gameData.Date && x.GameId !== gameData.GameId)
          .reduce((index, game) => Math.max(index, (game.SortIndex ?? 0) + 1), 0);
      } else {
        // Continue
      }

      const game = new GameEntity(gameData);
      game.Scores = this.playerGames.map((x) => new PlayerGameEntity(x));

      const result = await this.apiService.postGame(this.game.GameId === '', game);
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Play' });
        this.game = result;
        this.updateEditor();
        if (close) {
          this.closeEditor.emit();
        } else {
          // Stay
        }
      } else {
        // Do nothing
      }
    }
  }

  toDeleteEntity() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Deleting Play',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        const result = await this.apiService.deleteGame(this.game!.GameId);
        if (result) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted Play' });
          this.closeEditor.emit();
        } else {
          // Do nothing
        }
      },
    });
  }
}
