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
import { Table, TableModule } from 'primeng/table';
import { UserService } from '../shared/services/user.service';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { PipeModule } from '../shared/pipes/pipe.module';
import { InputTextModule } from 'primeng/inputtext';

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
    PipeModule,
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

  subscriptions = new Subscription();

  boardGameColumns = [
    { field: 'Name', name: 'Game', sort: true },
    { field: 'Games.length', name: 'Plays', sort: true },
    { field: '', name: 'Champion(s)', sort: false },
    { field: 'ChampionWins', name: 'Champion Wins', sort: true },
    { field: 'MaxPlayers', name: 'Max Player Count', sort: true },
    { field: 'AveragePlayers', name: 'Average Player Count', sort: true },
    { field: 'MaxScore', name: 'High Score', sort: true },
    { field: 'AverageScore', name: 'Average Score', sort: true },
    { field: 'AverageWinningScore', name: 'Average Winning Score', sort: true },
  ];

  playerColumns = [
    { field: 'Name', name: 'Game', sort: true },
    { field: 'Wins.length', name: 'Wins', sort: true },
    { field: '', name: 'Best Game(s)', sort: false },
    { field: 'BestGameWins', name: 'Best Game(s) Wins', sort: true },
  ];

  gameColumns = [
    { field: 'Date', name: 'Date', sort: true },
    { field: 'BoardGame.Name', name: 'Game', sort: true },
    { field: 'Players', name: 'Players', sort: true },
    { field: 'Winners', name: 'Winner(s)', sort: false },
    { field: 'HighScore', name: 'Points', sort: true },
    { field: 'DidNotFinish', name: 'Did Not Finish', sort: true },
  ];

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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  filterTable(table: Table, filter: Event) {
    table.filterGlobal((filter.target as HTMLInputElement).value, 'contains')
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

  showScore(game: GameEntity) {
    return game.BoardGame?.ScoreType === 'points';
  }
}
