import { Mode, PlayerEntity, PlayerGameEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyBestFriends extends ITrophy {
  constructor() {
    super('🫂', 'The Best Friends', ["If I didn't have you"], '2 players that win together the most.');
  }

  calculate(players: PlayerEntity[]) {
    const winList: Record<string, PlayerGameEntity[]> = {};
    this.value = 0;
    this.array = [];

    players.forEach((p) => {
      const id = p.PlayerId;
      winList[id] = [];

      p.PlayerGames.forEach((pg) => {
        if (pg.Game?.BoardGame?.ScoreType !== 'win-lose') {
          return;
        } else {
          // Calculate
        }
        const place = pg.Game?.findPlace(pg) ?? Infinity;
        if (place === 0) {
          winList[id].push(...(pg.Game?.place(0) ?? []).filter((x) => x !== pg));
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
