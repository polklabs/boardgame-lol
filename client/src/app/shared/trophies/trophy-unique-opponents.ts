import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyUniqueOpponents extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🦋'], 'The Social Butterfly', ["I'm just here to make friends."], 'Most unique opponents');
  }

  calculate(api: ApiService) {
    const butterflies = new Map<PlayerEntity, number>();

    for (const player of api.players.list) {
      const friendSet = new Set<string>();
      player.PlayerGames.forEach((pg) =>
        pg.Game?.Scores.forEach((score) => {
          score.PlayerIds.forEach((p) => friendSet.add(p));
        }),
      );
      friendSet.delete(player.PlayerId);
      friendSet.delete('');

      butterflies.set(player, friendSet.size);
    }

    this.applyValues(butterflies);
  }
}
