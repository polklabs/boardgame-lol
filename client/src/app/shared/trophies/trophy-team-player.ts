import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyTeamPlayer extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['👨‍👩‍👧‍👦'], 'The Team Player', ["I'm doing my part!"], 'Most wins when part of a team');
  }

  calculate(players: PlayerEntity[]) {
    const teamWins = players.map((p) => ({ item: p, count: p.Wins.filter((x) => x.Players.length > 1).length }));
    this.applyValues(teamWins);
  }
}
