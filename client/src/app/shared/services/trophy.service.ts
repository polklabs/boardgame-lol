import { Injectable, inject } from '@angular/core';
import { ITrophy } from '../trophies/trophy.model';
import { TrophyMostWins } from '../trophies/trophy-most-wins';
import { TrophyBestComeback } from '../trophies/trophy-best-comeback';
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
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrophyService {
  private _trophies: { [key: string]: ITrophy } = {
    MostWins: new TrophyMostWins(),
    BestComeback: new TrophyBestComeback(),
    LongestWinStreak: new TrophyLongestWinStreak(),
    MaxUniqueWins: new TrophyMaxUniqueWins(),
    MostTies: new TrophyMostTies(),
    MostWeekendWins: new TrophyMostWeekendWins(),
    MostPlays: new TrophyMostPlays(),
    MostPlaysOneDay: new TrophyMostPlaysOneDay(),
    FavXPlayerGame: new TrophyFavXPlayerGame(),
    LastGroupWin: new TrophyLastGroupWin(),
    UniqueOpponents: new TrophyUniqueOpponents(),
    MostLosses: new TrophyMostLosses(),
  } as const;

  readonly trophies$ = new BehaviorSubject<ITrophy[]>([]);

  constructor() {
    const apiService = inject(ApiService);

    apiService.dataUpdate$.subscribe(() => {
      const values = Object.values(this._trophies);
      values.forEach((t) => {
        t.update(apiService.playerList, apiService.gameList, apiService.boardGameList);
      });
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
