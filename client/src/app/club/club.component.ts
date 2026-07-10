import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';
import { EditorGameComponent } from '../editors/editor-game/editor-game.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { BoardGameEntity, ClubEntity, GameEntity, PlayerEntity } from 'libs/index';
import { EditorBoardGameComponent } from '../editors/editor-board-game/editor-board-game.component';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { EditorPlayerComponent } from '../editors/editor-player/editor-player.component';
import { TableModule } from 'primeng/table';
import { UserService } from '../shared/services/user.service';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { PipeModule } from '../shared/pipes/pipe.module';
import { InputTextModule } from 'primeng/inputtext';
import { GamesTableComponent } from './games-table/games-table.component';
import { PlayerTableComponent } from './player-table/player-table.component';
import { BoardGameTableComponent } from './board-game-table/board-game-table.component';
import { CardModule } from 'primeng/card';
import { StatsComponent } from './stats/stats.component';
import { EditorClubComponent } from '../editors/editor-club/editor-club.component';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { BadgeModule } from 'primeng/badge';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [
    MenuBarComponent,
    EditorGameComponent,
    EditorBoardGameComponent,
    EditorPlayerComponent,
    EditorClubComponent,
    CommonModule,
    TableModule,
    ButtonModule,
    TabsModule,
    InputTextModule,
    CardModule,
    PipeModule,
    GamesTableComponent,
    PlayerTableComponent,
    BoardGameTableComponent,
    StatsComponent,
    PopoverModule,
    FormsModule,
    MultiSelectModule,
    BadgeModule,
    FloatLabelModule,
    CheckboxModule,
    CalendarModule,
  ],
  templateUrl: './club.component.html',
  styleUrl: './club.component.scss',
})
export class ClubComponent implements OnInit, OnDestroy {
  title = '';
  canEdit = false;

  editorGameVisible = false;
  editGame?: GameEntity;

  editorBoardGameVisible = false;
  editBoardGame?: BoardGameEntity;

  editorPlayerVisible = false;
  editPlayer?: PlayerEntity;

  editorClubVisible = false;
  editClub?: ClubEntity;

  games$?: Observable<GameEntity[]>;
  boardGames$?: Observable<BoardGameEntity[]>;
  players$?: Observable<PlayerEntity[]>;

  activeTab = 'overview';

  subscriptions = new Subscription();

  // Filter
  filterEnabled$: Observable<boolean> = of(false);
  ogBoardGames$?: Observable<BoardGameEntity[]>;
  ogPlayers$?: Observable<PlayerEntity[]>;
  dow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  gameIds: string[] = [];
  playerIds: string[] = [];
  dnf = true;
  daysOfWeek = [...this.dow];
  months: string[] = [];
  startDate: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe((x) => {
        this.apiService.fetchClub(x['id']);
      }),
    );

    this.activeTab = this.route.snapshot.fragment ?? 'overview';

    this.subscriptions.add(
      combineLatest([this.apiService.club$, this.userService.accessIds$]).subscribe(([club, access]) => {
        this.title = club?.Name ?? '';
        this.canEdit = access.some((x) => x.id === club?.ClubId);
      }),
    );

    this.games$ = this.apiService.filteredGameList$;
    this.boardGames$ = this.apiService.filteredBoardGameList$;
    this.players$ = this.apiService.filteredPlayerList$;
    this.ogBoardGames$ = this.apiService.boardGameList$;
    this.ogPlayers$ = this.apiService.playerList$;
    this.filterEnabled$ = this.apiService.filterEnabled$;

    this.subscriptions.add(
      this.apiService.dataUpdate$.subscribe(() => {
        console.log('Reset Filter Data');
        this.gameIds = this.apiService.boardGameList.map((x) => x.BoardGameId ?? '');
        this.playerIds = this.apiService.playerList.map((x) => x.PlayerId ?? '');
        this.dnf = true;
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

  clubEdit() {
    this.editClub = this.apiService.club;
    this.editorClubVisible = true;
  }

  moveUp(game: GameEntity) {
    this.apiService.updateGameIndex(game.GameId, 1);
  }

  moveDown(game: GameEntity) {
    this.apiService.updateGameIndex(game.GameId, -1);
  }

  enableFilter(filter: Popover) {
    filter.hide();
    this.apiService.filter(true, this.playerIds, this.gameIds, this.daysOfWeek, this.startDate, this.dnf);
  }

  disableFilter(filter: Popover) {
    filter.hide();
    this.apiService.filter(false, [], [], [], null, true);
  }

  onTabChange(event: string | number) {
    this.router.navigate([], {
      fragment: `${event}`, // sets the #fragment
      queryParamsHandling: 'preserve', // keep existing query params
      preserveFragment: false, // overwrite existing fragment
    });
  }
}
