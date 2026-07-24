import { Injectable, inject } from '@angular/core';
import { ITrophy } from '../trophies/trophy.model';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';
import { TrophyMostWins } from '../trophies/trophy-most-wins';
import { TrophyComebackKid } from '../trophies/trophy-comeback-kid';
import { TrophyLongestWinStreak } from '../trophies/trophy-longest-win-streak';
import { TrophyMaxUniqueWins } from '../trophies/trophy-max-unique-wins';
import { TrophyMostTies } from '../trophies/trophy-most-ties';
import { TrophyMostWeekendWins } from '../trophies/trophy-most-weekend-wins';
import { TrophyMostPlays } from '../trophies/trophy-most-plays';
import { TrophyMostPlaysOneDay } from '../trophies/trophy-most-plays-one-day';
import { TrophyFavXPlayerGame } from '../trophies/trophy-fav-x-player-game';
import { TrophyLastGroupWin } from '../trophies/trophy-last-group-win';
import { TrophyUniqueOpponents } from '../trophies/trophy-unique-opponents';
import { TrophyMostLosses } from '../trophies/trophy-most-losses';
import { TrophySnail } from '../trophies/trophy-snail';
import { TrophyRivals } from '../trophies/trophy-rivals';
import { TrophyBestFriends } from '../trophies/trophy-best-friends';
import { TrophyHoarder } from '../trophies/trophy-hoarder';
import { TrophyNewPlayer } from '../trophies/trophy-new-player';
import { TrophyTeamPlayer } from '../trophies/trophy-team-player';
import { TrophyTieBreaker } from '../trophies/trophy-tie-breaker';
import { TrophyFavoriteCharacter } from '../trophies/trophy-favorite-character';
import { TrophyFavoriteGameVersion } from '../trophies/trophy-favorite-game-version';
import { TrophyDuo } from '../trophies/trophy-duo';
import { TrophyChameleon } from '../trophies/trophy-chameleon';
import { TrophyGameChanger } from '../trophies/trophy-game-changer';
import { TrophyGrimReaper } from '../trophies/trophy-grim-reaper';
import { TrophyVictor } from '../trophies/trophy-victor';
import { TrophyFatalPair } from '../trophies/trophy-fatal-pair';
import { TrophyWinningPair } from '../trophies/trophy-winning-pair';
import { TrophyPlayerIsCharacter } from '../trophies/trophy-player-is-character';

@Injectable({
  providedIn: 'root',
})
export class TrophyService {
  private _trophies: Record<string, ITrophy> = {
    MostWins: new TrophyMostWins(4),
    MostPlays: new TrophyMostPlays(4),
    LongestWinStreak: new TrophyLongestWinStreak(4),
    BestComeback: new TrophyComebackKid(4),
    MaxUniqueWins: new TrophyMaxUniqueWins(3),
    MostTies: new TrophyMostTies(3),
    TieBreaker: new TrophyTieBreaker(3),
    UniqueOpponents: new TrophyUniqueOpponents(3),
    MostLosses: new TrophyMostLosses(2),
    FirstWinDelay: new TrophySnail(2),
    Rivals: new TrophyRivals(3),
    BestFriends: new TrophyBestFriends(3),
    TeamPlayer: new TrophyTeamPlayer(3),
    Hoarder: new TrophyHoarder(2),
    GameChanger: new TrophyGameChanger(2),
    NewPlayer: new TrophyNewPlayer(2),
    MostWeekendWins: new TrophyMostWeekendWins(1),
    MostPlaysOneDay: new TrophyMostPlaysOneDay(1),
    FavXPlayerGame: new TrophyFavXPlayerGame(1),
    LastGroupWin: new TrophyLastGroupWin(1),

    // Tag Trophies
    FavCharacter: new TrophyFavoriteCharacter(3),
    FavGameVersion: new TrophyFavoriteGameVersion(3),
    Duo: new TrophyDuo(3),
    Chameleon: new TrophyChameleon(3),
    GrimReaper: new TrophyGrimReaper(2),
    Victor: new TrophyVictor(2),
    FatalPair: new TrophyFatalPair(3),
    WinningPair: new TrophyWinningPair(3),
    PlayerIsCharacter: new TrophyPlayerIsCharacter(3),
  } as const;

  readonly trophies$ = new BehaviorSubject<ITrophy[]>([]);

  constructor() {
    const apiService = inject(ApiService);

    apiService.dataUpdate$.subscribe(() => {
      const values = Object.values(this._trophies);
      values.forEach((t) => {
        t.update(apiService);
      });
      values.sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0) || b.value - a.value);
      this.trophies$.next(values);
    });
  }

  getTrophy(trophy: keyof typeof this._trophies): ITrophy {
    return this._trophies[trophy];
  }

  getTrophies(): ITrophy[] {
    return Object.values(this._trophies);
  }
}
