import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyTeamPlayer extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['👨‍👩‍👧‍👦'], 'The Team Player', ["I'm doing my part!"], 'Most wins when part of a team');
  }

  calculate(api: ApiService) {
    const teamWins = new Map<PlayerEntity, number>();
    api.players.list.forEach((p) => {
      teamWins.set(p, p.Wins.filter((x) => x.Players.length > 1).length);
    });
    this.applyValues(teamWins);
  }
}
