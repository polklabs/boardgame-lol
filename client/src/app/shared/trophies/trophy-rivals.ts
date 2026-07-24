import { Mode, PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyRivals extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      ['🏒', '🤼‍♂️'],
      'The Rivals',
      ['Anything you can do, I can do better'],
      '2 players with most 1st/2nd place wins in shared games.',
    );
  }

  calculate(api: ApiService) {
    const winList: Record<string, PlayerEntity[]> = {};
    this.value = 0;
    this.array = [];

    api.players.list.forEach((p) => {
      const id = p.PlayerId;
      winList[id] = [];

      p.PlayerGames.forEach((pg) => {
        if (pg.Game?.BoardGame?.ScoreType === 'win-lose') {
          return;
        } else {
          // Calculate
        }
        const place = pg.Game?.findPlace(pg) ?? Infinity;
        if (place === 0 || place === 1) {
          winList[id].push(
            ...(pg.Game?.placePlayers(1) ?? []).filter((x) => !pg.PlayerIds.has(x.PlayerId)),
            ...(pg.Game?.placePlayers(0) ?? []).filter((x) => !pg.PlayerIds.has(x.PlayerId)),
          );
        } else {
          // Not in 1st or 2nd, skip
        }
      });
    });

    Object.keys(winList).forEach((k) => {
      const mode = Mode(winList[k], (x) => x.PlayerId);
      if (mode.length > 0) {
        const modeCount = winList[k].filter((x) => x.PlayerId === mode[0].PlayerId).length;
        if (modeCount > this.value) {
          this.value = modeCount;
          this.array = [api.players.getOne(k), mode[0]];
        } else {
          // Continue
        }
      } else {
        // Continue
      }
    });
  }
}
