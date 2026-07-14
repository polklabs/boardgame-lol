import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';
import { EditorGameComponent } from '../editors/editor-game/editor-game.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { BoardGameEntity, ClubEntity, GameEntity, PlayerEntity } from 'libs/index';
import { EditorBoardGameComponent } from '../editors/editor-board-game/editor-board-game.component';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { EditorPlayerComponent } from '../editors/editor-player/editor-player.component';
import { UserService } from '../shared/services/user.service';
import { GamesTableComponent } from './games-table/games-table.component';
import { PlayerTableComponent } from './player-table/player-table.component';
import { BoardGameTableComponent } from './board-game-table/board-game-table.component';
import { StatsComponent } from './stats/stats.component';
import { EditorClubComponent } from '../editors/editor-club/editor-club.component';
import { TabsModule } from 'primeng/tabs';
import { EditorTagsComponent } from '../editors/editor-tags/editor-tags.component';
import { FilterComponent } from './filter/filter.component';

@Component({
  selector: 'app-club',
  imports: [
    MenuBarComponent,
    EditorGameComponent,
    EditorBoardGameComponent,
    EditorPlayerComponent,
    EditorClubComponent,
    EditorTagsComponent,
    CommonModule,
    TabsModule,
    GamesTableComponent,
    PlayerTableComponent,
    BoardGameTableComponent,
    StatsComponent,
    FilterComponent,
  ],
  templateUrl: './club.component.html',
  styleUrl: './club.component.scss',
})
export class ClubComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private userService = inject(UserService);

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

  editorTagsVisible = false;

  games$?: Observable<GameEntity[]>;
  boardGames$?: Observable<BoardGameEntity[]>;
  players$?: Observable<PlayerEntity[]>;

  activeTab = 'overview';

  subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe((x) => {
        this.apiService.fetchClub(x['id']);
      }),
    );

    this.activeTab = this.route.snapshot.fragment ?? 'overview';

    this.subscriptions.add(
      combineLatest([this.apiService.club$, this.userService.accessIds$, this.apiService.filterEnabled$]).subscribe(
        ([club, access, filter]) => {
          this.title = club?.Name ?? '';
          this.canEdit = access.some((x) => x.id === club?.ClubId) && !filter;
        },
      ),
    );

    this.games$ = this.apiService.filteredGameList$;
    this.boardGames$ = this.apiService.filteredBoardGameList$;
    this.players$ = this.apiService.filteredPlayerList$;
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

  tagsEdit() {
    console.log('Edit Tags');
    this.editorTagsVisible = true;
  }

  moveUp(game: GameEntity) {
    this.apiService.updateGameIndex(game.GameId, 1);
  }

  moveDown(game: GameEntity) {
    this.apiService.updateGameIndex(game.GameId, -1);
  }

  onTabChange(event?: string | number) {
    this.router.navigate([], {
      fragment: `${event ?? ''}`, // sets the #fragment
      queryParamsHandling: 'preserve', // keep existing query params
      preserveFragment: false, // overwrite existing fragment
    });
  }
}
