import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BoardGameEntity, GameEntity, isGuid, PlayerEntity, PlayerGameEntity } from 'libs/index';
import { ApiService } from '../shared/services/api.service';
import { MessageService } from 'primeng/api';
import { buildForm } from '../shared/form.utils';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { OrderListModule } from 'primeng/orderlist';
import { ButtonModule } from 'primeng/button';
import { EditorPlayerComponent } from '../editor-player/editor-player.component';
import { EditorBoardGameComponent } from '../editor-board-game/editor-board-game.component';
import { DropdownComponent } from '../shared/components/dropdown/dropdown.component';
import { TextInputComponent } from '../shared/components/textinput/textinput.component';
import { EditorPlayerGameComponent } from '../editor-player-game/editor-player-game.component';
import { CalendarComponent } from '../shared/components/calendar/calendar.component';
import { CheckboxModule } from 'primeng/checkbox';

type EntityType = GameEntity;

@Component({
  selector: 'app-editor-game',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    DropdownComponent,
    TextInputComponent,
    CalendarComponent,
    CheckboxModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorPlayerComponent,
    EditorBoardGameComponent,
    EditorPlayerGameComponent,
    OrderListModule,
  ],
  templateUrl: './editor-game.component.html',
  styleUrl: './editor-game.component.scss',
})
export class EditorGameComponent implements OnChanges {
  @Input() editorVisible = false;
  @Input() game?: GameEntity;
  @Output() closeEditor = new EventEmitter<void>();

  title = 'Edit Game';
  isNew = false;

  entityType = GameEntity;

  private playerList: PlayerEntity[] = [];
  private boardGameList: BoardGameEntity[] = [];

  get boardGames() {
    return [...this.boardGameList, ...this.newBoardGames].sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? ''));
  }

  get selectedBoardGame() {
    const id = this.formGroup.controls['BoardGameId'].value;
    return this.boardGames.find((x) => x.BoardGameId === id);
  }

  get players() {
    return [...this.playerList, ...this.newPlayers].sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? ''));
  }

  playerGames: PlayerGameEntity[] = [];
  newPlayers: PlayerEntity[] = [];
  newBoardGames: BoardGameEntity[] = [];

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  playerGameEditorVisible = false;
  playerGameEdit?: PlayerGameEntity;

  playerEditorVisible = false;
  playerEdit?: PlayerEntity;

  boardGameEditorVisible = false;
  boardGameEdit?: BoardGameEntity;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('game' in changes && this.game) {
      this.game = new GameEntity(this.game, true);
      if (this.game.GameId === null) {
        this.title = 'New Game';
        this.isNew = true;
      } else {
        this.title = 'Edit Game';
        this.isNew = false;
      }

      this.grabLists();

      if (this.isNew) {
        this.game.BoardGameId = this.boardGames[0]?.BoardGameId ?? null;
        this.game.Date = new Date();
      } else {
        const date = new Date(this.game.Date);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        this.game.Date = new Date(date.getTime() + userTimezoneOffset);
      }

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new GameEntity());
      this.formGroup.patchValue(new GameEntity(this.game));
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  grabLists() {
    this.playerList = this.apiService.playerList;
    this.boardGameList = this.apiService.boardGameList;

    this.playerGames = this.apiService.playerGameList
      .filter((x) => x.GameId === this.game?.GameId)
      .map((m) => new PlayerGameEntity(m, true));
    this.playerGames.sort((a, b) => (a.Points ?? 0) - (b.Points ?? 0));
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  updateSortOrder() {
    // TODO
  }

  editPlayerGame(playerGame?: PlayerGameEntity) {
    if (!playerGame) {
      this.playerGameEdit = new PlayerGameEntity({ ClubId: this.game?.ClubId, GameId: '-1' });
    } else {
      this.playerGameEdit = playerGame;
    }
    this.playerGameEditorVisible = true;
  }

  savePlayerGame(playerGame?: PlayerGameEntity) {
    if (playerGame) {
      const index = this.playerGames.indexOf(playerGame);
      if (index === -1) {
        this.playerGames = [...this.playerGames, playerGame];
      } else {
        // continue
      }
    } else {
      // continue
    }
    this.playerGameEdit = undefined;
    this.playerGameEditorVisible = false;
  }

  deletePlayerGame(playerGame?: PlayerGameEntity) {
    if (playerGame) {
      const index = this.playerGames.indexOf(playerGame);
      if (index !== -1) {
        this.playerGames.splice(index, 1);
        this.playerGames = [...this.playerGames];
      } else {
        // continue
      }
    } else {
      // continue
    }

    this.playerGameEdit = undefined;
    this.playerGameEditorVisible = false;
  }

  editPlayer(player?: PlayerEntity) {
    if (!player) {
      let nextId = 0;
      while (this.newPlayers.find((x) => x.PlayerId === `${nextId}`)) {
        nextId++;
      }
      this.playerEdit = new PlayerEntity({ PlayerId: `${nextId}`, ClubId: this.game?.ClubId });
    } else {
      this.playerEdit = player;
    }
    this.playerEditorVisible = true;
  }

  savePlayer(player?: PlayerEntity) {
    if (player) {
      const index = this.newPlayers.indexOf(player);
      if (index === -1) {
        this.newPlayers = [...this.newPlayers, player];
      } else {
        // continue
      }
    } else {
      // continue
    }
    this.playerEdit = undefined;
    this.playerEditorVisible = false;
  }

  deletePlayer(player?: PlayerEntity) {
    if (player) {
      const index = this.newPlayers.indexOf(player);
      if (index !== -1) {
        this.newPlayers.splice(index, 1);
        this.newPlayers = [...this.newPlayers];
      } else {
        // continue
      }
    } else {
      // continue
    }

    this.playerEdit = undefined;
    this.playerEditorVisible = false;
  }

  canEditBoardGame() {
    const value = this.formGroup.controls['BoardGameId'].value;
    if (isGuid(value) || value === null || value === undefined) {
      return false;
    } else {
      return true;
    }
  }

  editBoardGame(boardGame?: BoardGameEntity) {
    if (!boardGame) {
      let nextId = 0;
      while (this.newBoardGames.find((x) => x.BoardGameId === `${nextId}`)) {
        nextId++;
      }
      this.boardGameEdit = new BoardGameEntity({ BoardGameId: `${nextId}`, ClubId: this.game?.ClubId });
    } else {
      this.boardGameEdit = boardGame;
    }
    this.boardGameEditorVisible = true;
  }

  saveBoardGame(boardGame?: BoardGameEntity) {
    this.formGroup.controls['BoardGameId'].setValue(null);
    if (boardGame) {
      const index = this.newBoardGames.indexOf(boardGame);
      if (index === -1) {
        this.newBoardGames = [...this.newBoardGames, boardGame];
      } else {
        // continue
      }
      this.formGroup.controls['BoardGameId'].setValue(boardGame.BoardGameId);
    } else {
      // continue
    }
    this.boardGameEdit = undefined;
    this.boardGameEditorVisible = false;
    this.cdr.detectChanges();
  }

  deleteBoardGame(boardGame?: BoardGameEntity) {
    if (boardGame) {
      const index = this.newBoardGames.indexOf(boardGame);
      if (index !== -1) {
        this.newBoardGames.splice(index, 1);
        this.newBoardGames = [...this.newBoardGames];
      } else {
        // continue
      }
    } else {
      // continue
    }

    const id = this.formGroup.controls['BoardGameId'].value;
    if (boardGame?.BoardGameId === id) {
      this.formGroup.controls['BoardGameId'].setValue(this.boardGames[0]?.BoardGameId ?? null);
    } else {
      // Continue
    }

    this.boardGameEdit = undefined;
    this.boardGameEditorVisible = false;
  }

  async submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.game) {
      return;
    } else {
      const result = await this.apiService.postGame(this.game.GameId === null, {
        Game: this.formGroup.getRawValue(),
        PlayerGames: this.playerGames.map((x) => new PlayerGameEntity(x)),
        BoardGames: this.newBoardGames,
        Players: this.newPlayers,
      });
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Game' });
        this.closeEditor.emit();
      } else {
        // Do nothing
      }
    }
  }
}
