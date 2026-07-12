import { Mode, PlayerEntity, PlayerGameEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyRivals extends ITrophy {
  constructor() {
    super(
      '🏒',
      'The Rivals',
      ['Anything you can do, I can do better'],
      '2 players with most 1st/2nd place wins in shared games.',
    );
  }

  calculate(players: PlayerEntity[]) {
    const winList: Record<string, PlayerGameEntity[]> = {};
    this.value = 0;
    this.array = [];

    players.forEach((p) => {
      const id = p.PlayerId ?? '';
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
            ...(pg.Game?.place(1) ?? []).filter((x) => x !== pg),
            ...(pg.Game?.place(0) ?? []).filter((x) => x !== pg),
          );
        } else {
          // Not in 1st or 2nd, skip
        }
      });
    });

    Object.keys(winList).forEach((k) => {
      const mode = Mode(winList[k], (x) => x.PlayerId ?? '');
      if (mode.length > 0) {
        const modeCount = winList[k].filter((x) => x.PlayerId === mode[0].PlayerId).length;
        if (modeCount > this.value) {
          this.value = modeCount;
          this.array = [players.find((x) => x.PlayerId === k), mode[0].Player];
        } else {
          // Continue
        }
      } else {
        // Continue
      }
    });
  }
}
