import { Component, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';
import { EditorGameComponent } from '../editor-game/editor-game.component';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { BoardGameEntity, GameEntity, PlayerEntity } from 'libs/index';
import { EditorBoardGameComponent } from '../editor-board-game/editor-board-game.component';
import { Observable } from 'rxjs';
import { EditorPlayerComponent } from '../editor-player/editor-player.component';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [MenuBarComponent, EditorGameComponent, EditorBoardGameComponent, EditorPlayerComponent, CommonModule],
  templateUrl: './club.component.html',
  styleUrl: './club.component.scss',
})
export class ClubComponent implements OnInit {
  editorGameVisible = false;
  editGame?: GameEntity;

  editorBoardGameVisible = false;
  editBoardGame?: BoardGameEntity;

  editorPlayerVisible = false;
  editPlayer?: PlayerEntity;

  games$?: Observable<GameEntity[]>;
  boardGames$?: Observable<BoardGameEntity[]>;
  players$?: Observable<PlayerEntity[]>;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((x) => {
      console.log(x);
      this.apiService.fetchClub(x['id']);
    });

    this.games$ = this.apiService.gameList$;
    this.boardGames$ = this.apiService.boardGameList$;
    this.players$ = this.apiService.playerList$;
  }

  newGame() {
    this.editGame = new GameEntity({ ClubId: this.apiService.clubId });
    this.editorGameVisible = true;
  }

  newBoardGame() {
    this.editBoardGame = new BoardGameEntity({ ClubId: this.apiService.clubId });
    this.editorBoardGameVisible = true;
  }

  newPlayer() {
    this.editPlayer = new PlayerEntity({ ClubId: this.apiService.clubId });
    this.editorPlayerVisible = true;
  }
}
