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
import { BoardGameEntity, CopyAttrsMapping, CopyAttrType, GameEntity, getMinMax, PlayerGameEntity } from 'libs/index';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { buildForm } from '../../shared/form.utils';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { OrderListModule } from 'primeng/orderlist';
import { ButtonModule } from 'primeng/button';
import { EditorBoardGameComponent } from '../editor-board-game/editor-board-game.component';
import { DropdownComponent } from '../../shared/components/form-components/dropdown/dropdown.component';
import { EditorPlayerGameComponent } from '../editor-player-game/editor-player-game.component';
import { CalendarComponent } from '../../shared/components/form-components/calendar/calendar.component';
import { Subscription } from 'rxjs';
import { format } from 'date-fns';
import { TextareaComponent } from '../../shared/components/form-components/textarea/textarea.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TagsComponent } from '../../shared/components/form-components/tags/tags.component';
import { TooltipModule } from 'primeng/tooltip';
import { TagComponent } from '../../shared/components/tag/tag.component';
import { ScorePipe } from '../../shared/pipes/score.pipe';
import { PlayerGamePlayerEntity } from 'libs/models/PlayerGamePlayer.entity';
import { NumberInputComponent } from '../../shared/components/form-components/number-input/number-input.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { sortPlayerGames } from '../../shared/helpers/data.helper';
import { CheckboxComponent } from '../../shared/components/form-components/checkbox/checkbox.component';
import { HideDirective } from '../../shared/directives/hide.directive';

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
    CheckboxComponent,
    TagsComponent,
    TooltipModule,
    TagComponent,
    ScorePipe,
    HideDirective,
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

  protected selectedPlayerScores: PlayerGameEntity[] = [];
  playerScores: PlayerGameEntity[] = [];

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  playerGameEditorVisible = false;
  playerGameEdit?: PlayerGameEntity;

  boardGameEditorVisible = false;
  boardGameEdit?: BoardGameEntity;

  showCustomPointsDialog = false;
  customPointAdjustment: number | null = null;

  maxVirtualPoints = 0;

  pointGroupButtonValues: number[] = [];

  subscriptions = new Subscription();

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
      this.closeEditor.emit();
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

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new GameEntity());
      const instance = new GameEntity(this.game);
      instance.WinOverride = this.game.WinOverride;
      this.formGroup.patchValue(instance);

      if (this.isNew) {
        Object.keys(this.formGroup.controls).forEach((k) => {
          this.hideFields.add(k as keyof GameEntity);
        });
        this.hideFields.delete('BoardGameId');
      } else {
        // Nothing
      }

      this.subscriptions.add(
        this.getControl('BoardGameId')?.valueChanges.subscribe((value) => {
          const previous = this.game!.BoardGame;
          this.hideFields.clear();
          this.game!.BoardGameId = value;
          this.game!.BoardGame = this.apiService.boardGames.getOne(value);
          this.boardGameSideEffects();
          this.updateScoring();
          this.tryCopyFromRef(previous !== null);
        }),
      );

      this.updatePlayerCount();
      this.subscriptions.add(
        this.getControl('Players')?.valueChanges.subscribe(() => {
          this.updatePlayerCount();
        }),
      );

      this.subscriptions.add(
        this.getControl('HigherWins')?.valueChanges.subscribe((value) => {
          this.game!.HigherWins = value;
          this.updateScoring();
        }),
      );

      this.subscriptions.add(
        this.getControl('WinOverride')?.valueChanges.subscribe(() => {
          this.playerScores.forEach((pg) => (pg.TieBreaker = false));
          this.updateScoring();
        }),
      );

      this.boardGameSideEffects();
      this.updateScoring();

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
    this.subscriptions.unsubscribe();

    if (this.wakeLock) {
      this.wakeLock.release();
      console.log('Wake lock released');
    } else {
      // Continue
    }
  }

  grabLists() {
    this.playerScores = this.apiService.playerGames.raw
      .filter((x) => x.GameId === this.game?.GameId)
      .map((m) => {
        const toReturn = new PlayerGameEntity(m, true);
        toReturn.Game = this.game!;
        return toReturn;
      });
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  getValue(key: keyof EntityType) {
    return this.getControl(key)?.value;
  }

  boardGameSideEffects() {
    this.game!.HigherWins = this.game!.BoardGame?.HigherWins ?? true;
    this.getControl('HigherWins')?.setValue(this.game!.HigherWins);
    if (this.game!.ScoreType === 'points') {
      this.hideFields.delete('HigherWins');
      this.hideFields.delete('WinOverride');
    } else {
      this.hideFields.add('HigherWins');
      this.hideFields.add('WinOverride');
    }
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

    const pointBase = this.game?.BoardGame?.PointAdjustBase ?? null;
    const pointStep = this.game?.BoardGame?.PointAdjustStep ?? null;
    if (pointBase === null && pointStep === null) {
      for (let i = 0; i < count; i++) {
        this.pointGroupButtonValues.push(POINT_VALUES[i] ?? (this.pointGroupButtonValues.at(-1) ?? 0) + 100);
      }
    } else {
      for (let i = 0; i < count; i++) {
        this.pointGroupButtonValues.push((pointBase || 1) + (pointStep || 1) * i);
      }
    }
  }

  addPoints(points: number | null) {
    const minMax = getMinMax(PlayerGameEntity)['Points'];
    this.selectedPlayerScores.forEach((p) => {
      p.Points = Math.max(minMax.min ?? -Infinity, Math.min(minMax.max ?? Infinity, (p.Points ?? 0) + (points ?? 0)));
    });
    this.updateScoring();
  }

  setPoints(points: number) {
    const minMax = getMinMax(PlayerGameEntity)['Points'];
    this.selectedPlayerScores.forEach((p) => {
      p.Points = Math.max(minMax.min ?? -Infinity, Math.min(minMax.max ?? Infinity, points));
    });
    this.updateScoring();
  }

  customPoints() {
    this.showCustomPointsDialog = true;
    this.customPointAdjustment = null;
  }

  onPlayerSelection(event: PlayerGameEntity[]) {
    if (this.playerGameEditorVisible) {
      this.selectedPlayerScores = [];
      return;
    } else {
      // Continue
    }

    for (const item of event) {
      if (!this.selectedPlayerScores.includes(item)) {
        this.selectedPlayerScores = [item];
        this.calculatePointButtons();
        return;
      } else {
        // Continue
      }
    }
    this.selectedPlayerScores = [];
  }

  updateOrdering() {
    if (this.game?.BoardGame?.ScoreType === 'rank') {
      let nonPlayers = 0;
      for (let i = 0; i < this.playerScores.length; i++) {
        const pg = this.playerScores[i];
        if (pg.ScoringPlayer) {
          pg.Points = i - nonPlayers;
        } else {
          nonPlayers += 1;
          pg.Points = null;
        }
      }
    } else {
      // Continue
    }
  }

  tieBreak(playerGame: PlayerGameEntity, checked: boolean) {
    this.playerScores.forEach((pg) => {
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
        this.playerScores.forEach((pg) => {
          if (pg.Points === null) {
            // continue
          } else if (pg.Points > 0) {
            pg.Points = 1;
          } else {
            pg.Points = 0;
          }
        });
        break;
      case 'points':
        this.maxVirtualPoints = Math.max(...this.playerScores.map((x) => x.VirtualPoints ?? -Infinity));
        break;
      default:
        break;
    }
    this.playerScores = [...sortPlayerGames(true, this.playerScores)];
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

  editPlayerGame(playerGame?: PlayerGameEntity, player = true) {
    if (playerGame) {
      this.playerGameEdit = playerGame;
    } else {
      this.playerGameEdit = new PlayerGameEntity({
        ClubId: this.game?.ClubId,
        GameId: '-1',
        Points: player ? 0 : null,
        ScoringPlayer: player,
      });
      this.playerGameEdit.Game = this.game!;
      const existingPlayers = new Set(this.playerScores.flatMap((x) => x.Players.map((p) => p.PlayerId)));
      this.playerGameEdit.Players = [this.apiService.players.raw.find((x) => !existingPlayers.has(x.PlayerId))].filter(
        (x) => x !== undefined,
      );
    }
    this.playerGameEditorVisible = true;
  }

  savePlayerGame(pg?: PlayerGameEntity) {
    if (pg) {
      pg.Game = this.game!;
      const scoreIndex = this.playerScores.indexOf(pg);
      if (scoreIndex !== -1) {
        this.playerScores.splice(scoreIndex, 1);
      } else {
        // Continue
      }
      this.playerScores.push(pg);

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
      const index = this.playerScores.indexOf(playerGame);
      if (index === -1) {
        // continue
      } else {
        this.playerScores.splice(index, 1);
        this.playerScores = [...this.playerScores];
      }
    } else {
      // continue
    }

    this.playerGameEdit = undefined;
    this.playerGameEditorVisible = false;
    this.selectedPlayerScores = [];
    this.updateScoring();
    this.updatePlayerCount();
  }

  addBoardGame() {
    this.boardGameEdit = new BoardGameEntity({ BoardGameId: '', ClubId: this.game?.ClubId });
    this.boardGameEditorVisible = true;
  }

  updatePlayerCount() {
    this.game!.Scores = this.playerScores;
    this.game!.Players = this.getControl('Players')?.value;
  }

  tryCopyFromRef(ask: boolean) {
    const id = this.game?.BoardGame?.NewGameRefId;
    const items = new Set(this.game?.BoardGame?.NewGameRefCopyItems ?? []);
    if (this.game?.GameId !== id && id && items.size > 0) {
      // Continue
    } else {
      return;
    }

    if (ask) {
      this.confirmationService.confirm({
        message: `Copying: ${[...items].map((x) => CopyAttrsMapping[x]).join(', ')}.<br><br>This may overwrite existing data. Do you want to proceed?`,
        header: 'Copy Info From Reference Play',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: 'none',
        rejectIcon: 'none',
        rejectButtonStyleClass: 'p-button-text',
        accept: async () => {
          this.copyFromRef(id, items);
        },
      });
    } else {
      this.copyFromRef(id, items);
    }
  }

  copyFromRef(id: string, items: Set<CopyAttrType>) {
    const copyFrom = this.apiService.games.getOne(id);
    if (copyFrom) {
      // Continue
    } else {
      return;
    }

    if (items.has('Np') || items.has('P')) {
      this.playerScores = this.playerScores.filter(
        (x) => (!items.has('Np') && !x.ScoringPlayer) || (!items.has('P') && x.ScoringPlayer),
      );
      this.playerScores.push(
        ...copyFrom.Scores.filter(
          (x) => !((!items.has('Np') && !x.ScoringPlayer) || (!items.has('P') && x.ScoringPlayer)),
        ).map((pg) => {
          const newPg = new PlayerGameEntity({
            ClubId: this.apiService.clubId,
            GameId: '-1',
            Points: items.has('S') ? pg.Points : undefined,
            ScoringPlayer: pg.ScoringPlayer,
            PlayerLinks: pg.Players.map(
              (p) =>
                new PlayerGamePlayerEntity({
                  ClubId: this.apiService.clubId,
                  PlayerGameId: pg.PlayerGameId,
                  PlayerId: p.PlayerId,
                }),
            ),
            Tags: items.has('Tp') ? pg.Tags : [],
          });
          newPg.Players = pg.Players;
          return newPg;
        }),
      );

      this.playerScores.forEach((pg) => pg.PlayerLinks.forEach((pl) => (pl.PlayerGameId = pg.PlayerGameId)));
    } else {
      // Nothing
    }

    if (items.has('T')) {
      this.getControl('Tags')?.setValue(copyFrom.Tags);
    } else {
      // Continue
    }

    if (items.has('N')) {
      this.getControl('Notes')?.setValue(copyFrom.Notes);
    } else {
      // Continue
    }

    console.log(this.playerScores);
    this.updateScoring();
    this.updatePlayerCount();
  }

  async submit(close: boolean) {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.game) {
      return;
    } else {
      const gameData = this.formGroup.getRawValue();
      gameData.Date = format(gameData.DateObj, 'yyyy-MM-dd');
      const oldDate = format(this.game.DateObj, 'yyyy-MM-dd');

      if (this.isNew || oldDate !== gameData.Date) {
        gameData.SortIndex = this.apiService.games.raw
          .filter((x) => x.Date === gameData.Date && x.GameId !== gameData.GameId)
          .reduce((index, game) => Math.max(index, (game.SortIndex ?? 0) + 1), 0);
      } else {
        // Continue
      }

      if (gameData.HigherWins === this.game.BoardGame?.HigherWins || this.game.ScoreType !== 'points') {
        gameData.HigherWins = null;
      } else {
        // Keep override
      }

      const game = new GameEntity(gameData);
      game.Scores = this.playerScores.map((x) => new PlayerGameEntity(x));

      const result = await this.apiService.postGame(this.game.GameId === '', game);
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Play' });

        if (close) {
          this.closeEditor.emit();
        } else {
          this.game = result;
          this.updateEditor();
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
