import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BoardGameEntity, GameEntity, PlayerEntity, PlayerGameEntity } from 'libs/index';
import { ApiService } from '../shared/services/api.service';
import { MessageService } from 'primeng/api';
import { buildForm } from '../shared/form.utils';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { OrderListModule } from 'primeng/orderlist';
import { TextInputComponent } from '../shared/components/textinput/textinput.component';
import { ButtonModule } from 'primeng/button';
import { EditorPlayerComponent } from '../editor-player/editor-player.component';
import { EditorBoardGameComponent } from '../editor-board-game/editor-board-game.component';

type EntityType = GameEntity;

@Component({
  selector: 'app-editor-game',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TextInputComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorPlayerComponent,
    EditorBoardGameComponent,
    OrderListModule,
  ],
  templateUrl: './editor-game.component.html',
  styleUrl: './editor-game.component.scss',
})
export class EditorGameComponent implements OnChanges {
  @Input() editorVisible = false;
  @Output() closeEditor = new EventEmitter<void>();

  title = 'Edit Game';
  isNew = false;

  entityType = GameEntity;

  game?: GameEntity;

  players: PlayerEntity[] = [];
  boardGames: BoardGameEntity[] = [];

  playerGames: PlayerGameEntity[] = [];
  newPlayers: PlayerEntity[] = [];
  newBoardGames: BoardGameEntity[] = [];

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

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
      if (this.game.GameId === null) {
        this.title = 'New Game';
        this.isNew = true;
      } else {
        this.title = 'Edit Game';
        this.isNew = false;
      }

      this.grabLists();

      this.hideFields = new Set();
      this.formGroup = buildForm(this.fb, this.entityType, new GameEntity());
      this.formGroup.patchValue(this.game);
    } else {
      // No Changes
    }
    this.cdr.detectChanges();
  }

  grabLists() {
    this.players = this.apiService.playerList;
    this.players.sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? ''));

    this.boardGames = this.apiService.boardGameList;
    this.boardGames.sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? ''));

    this.playerGames = this.apiService.playerGameList
      .filter((x) => x.GameId === this.game?.GameId)
      .map((m) => new PlayerGameEntity(m));
    this.playerGames.sort((a, b) => (a.Points ?? 0) - (b.Points ?? 0));
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  updateSortOrder() {
    // TODO
  }

  editPlayer(player?: PlayerEntity) {
    if (!player) {
      this.playerEdit = new PlayerEntity();
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

  editBoardGame(boardGame?: BoardGameEntity) {
    if (!boardGame) {
      this.boardGameEdit = new BoardGameEntity();
    } else {
      this.boardGameEdit = boardGame;
    }
    this.boardGameEditorVisible = true;
  }

  saveBoardGame(boardGame?: BoardGameEntity) {
    if (boardGame) {
      const index = this.newBoardGames.indexOf(boardGame);
      if (index === -1) {
        this.newBoardGames = [...this.newBoardGames, boardGame];
      } else {
        // continue
      }
    } else {
      // continue
    }
    this.boardGameEdit = undefined;
    this.boardGameEditorVisible = false;
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
        PlayerGames: this.playerGames,
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
