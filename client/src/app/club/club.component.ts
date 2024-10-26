import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';
import { EditorGameComponent } from '../editor-game/editor-game.component';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { BoardGameEntity, GameEntity, PlayerEntity } from 'libs/index';
import { EditorBoardGameComponent } from '../editor-board-game/editor-board-game.component';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { EditorPlayerComponent } from '../editor-player/editor-player.component';
import { TableModule } from 'primeng/table';
import { UserService } from '../shared/services/user.service';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { PipeModule } from '../shared/pipes/pipe.module';
import { InputTextModule } from 'primeng/inputtext';
import { StatsModel } from '../shared/models/stats.model';
import { GamesTableComponent } from './games-table/games-table.component';
import { PlayerTableComponent } from './player-table/player-table.component';
import { BoardGameTableComponent } from './board-game-table/board-game-table.component';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [
    MenuBarComponent,
    EditorGameComponent,
    EditorBoardGameComponent,
    EditorPlayerComponent,
    CommonModule,
    TableModule,
    ButtonModule,
    TabViewModule,
    InputTextModule,
    CardModule,
    PipeModule,
    GamesTableComponent,
    PlayerTableComponent,
    BoardGameTableComponent,
  ],
  templateUrl: './club.component.html',
  styleUrl: './club.component.scss',
})
export class ClubComponent implements OnInit, OnDestroy {
  canEdit = false;

  editorGameVisible = false;
  editGame?: GameEntity;

  editorBoardGameVisible = false;
  editBoardGame?: BoardGameEntity;

  editorPlayerVisible = false;
  editPlayer?: PlayerEntity;

  games$?: Observable<GameEntity[]>;
  boardGames$?: Observable<BoardGameEntity[]>;
  players$?: Observable<PlayerEntity[]>;

  stats?: StatsModel;

  subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe((x) => {
        console.log(x);
        this.apiService.fetchClub(x['id']);
      }),
    );

    this.subscriptions.add(
      combineLatest([this.apiService.club$, this.userService.accessIds$]).subscribe(([club, access]) => {
        this.canEdit = access.find((x) => x.id === club?.ClubId) !== undefined;
      }),
    );

    this.userService.canEdit$;

    this.games$ = this.apiService.gameList$;
    this.boardGames$ = this.apiService.boardGameList$;
    this.players$ = this.apiService.playerList$;

    this.subscriptions.add(
      this.apiService.stats$.subscribe((stats) => {
        this.stats = stats;
        console.log(stats);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  newGame() {
    this.editGame = new GameEntity({ ClubId: this.apiService.clubId });
    this.editorGameVisible = true;
  }

  gameEdit(game: GameEntity) {
    this.editGame = game;
    this.editorGameVisible = true;
  }

  newBoardGame() {
    this.editBoardGame = new BoardGameEntity({ ClubId: this.apiService.clubId });
    this.editorBoardGameVisible = true;
  }
  boardGameEdit(boardGame: BoardGameEntity) {
    this.editBoardGame = boardGame;
    this.editorBoardGameVisible = true;
  }

  newPlayer() {
    this.editPlayer = new PlayerEntity({ ClubId: this.apiService.clubId });
    this.editorPlayerVisible = true;
  }

  playerEdit(player: PlayerEntity) {
    this.editPlayer = player;
    this.editorPlayerVisible = true;
  }
}
