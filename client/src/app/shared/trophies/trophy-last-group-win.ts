import { BoardGameEntity, GameEntity, PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { differenceInDays, max } from 'date-fns';

export class TrophyLastGroupWin extends ITrophy {
  constructor() {
    super('📆', "We're All In This Together", 'Days since everyone playing the game won');
  }

  calculate(_players: PlayerEntity[], games: GameEntity[]) {
    const groupWins = games.filter((x) => x.Winners.length === x.Players);
    const maxDate = max(groupWins.map((x) => x.DateObj));

    this.array = groupWins
      .filter((x) => x.DateObj === maxDate)
      .map((x) => x.BoardGame)
      .filter((x) => x !== null) as BoardGameEntity[];

    if (groupWins.length > 0) {
      this.value = differenceInDays(new Date(), maxDate);
    } else {
      this.value = Infinity;
    }
  }
}
