import { PlayerEntity } from 'libs/index';
import { ApplyObj, ITrophy } from './trophy.model';

export class TrophyUniqueOpponents extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, '🦋', 'The Social Butterfly', ["I'm just here to make friends."], 'Most unique opponents');
  }

  calculate(players: PlayerEntity[]) {
    const butterflies: ApplyObj = [];

    for (const player of players) {
      const friendSet = new Set<string>();
      player.PlayerGames.forEach((pg) =>
        pg.Game?.Scores.forEach((score) => {
          score.PlayerIds.forEach((p) => friendSet.add(p));
        }),
      );
      friendSet.delete(player.PlayerId);
      friendSet.delete('');

      butterflies.push({ item: player, count: friendSet.size });
    }

    this.applyValues(butterflies);
  }
}
