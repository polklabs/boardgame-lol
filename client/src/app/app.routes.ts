import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ClubComponent } from './club/club.component';
import { BoardGameComponent } from './board-game/board-game.component';
import { PlayerComponent } from './player/player.component';

export const routes: Routes = [
  { path: 'club/:id', component: ClubComponent },
  { path: 'club/board-game', component: BoardGameComponent },
  { path: 'club/player', component: PlayerComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];
