import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyBasic extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['💁‍♀️', '💁‍♂️', '💁'], 'The Basic', ['#Hashtag'], 'Players with most common name');
  }

  calculate(api: ApiService) {
    const playerNames = new Map<string, number>();

    for (const player of api.players.list) {
      playerNames.set(player.FirstName, (playerNames.get(player.FirstName) ?? 0) + 1);
    }

    this.applyValues(playerNames);
  }
}
