import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyUniqueOpponents extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, '🦋', 'The Social Butterfly', ["I'm just here to make friends."], 'Most unique opponents');
  }

  calculate(players: PlayerEntity[]) {
    const butterflies: { player: PlayerEntity; friends: number }[] = [];

    for (const player of players) {
      const friendSet = new Set<string>();
      player.PlayerGames.forEach((pg) =>
        pg.Game?.Scores.forEach((score) => {
          score.PlayerIds.forEach((p) => friendSet.add(p));
        }),
      );
      friendSet.delete(player.PlayerId);
      friendSet.delete('');

      butterflies.push({ player, friends: friendSet.size });
    }

    this.value = Math.max(0, ...butterflies.map((x) => x.friends));
    this.array = butterflies.filter((x) => x.friends === this.value).map((x) => x.player);
  }
}
