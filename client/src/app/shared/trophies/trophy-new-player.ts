import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { differenceInDays, min } from 'date-fns';

export class TrophyNewPlayer extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🐣'], 'The Newbie', ["We're so happy you're here"], 'Newest player');
    this.showValue = false;
  }

  calculate(players: PlayerEntity[]) {
    const today = new Date();
    const dataMap: { player: PlayerEntity; total: number }[] = [];
    players.forEach((player: PlayerEntity) => {
      const dates = player.PlayerGames.map((x) => x.Game?.DateObj).filter((x) => x !== undefined);
      dataMap.push({
        player,
        total: dates.length > 0 ? differenceInDays(today, min(dates)) : Infinity,
      });
    });

    this.value = dataMap.reduce((prev, curr) => Math.min(prev, curr.total), Infinity);
    this.array = dataMap.filter((x) => this.value > 0 && x.total === this.value).map((x) => x.player);
  }
}
