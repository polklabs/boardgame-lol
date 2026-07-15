import { GameEntity, PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyComebackKid extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      '🕺',
      'The Comeback Kid',
      ["Can't keep a good player down", "Guess who's back? Back again", 'Bringing boardgames back'],
      'Max # of games played between wins.',
    );
  }

  calculate(players: PlayerEntity[], games: GameEntity[]) {
    const streakPlayers: { player: PlayerEntity; streak: number }[] = [];

    for (const player of players) {
      const loseStreaks: number[] = [];
      let losses = 0;
      for (const game of games) {
        if (game.place(0).some((x) => x.PlayerIds.has(player.PlayerId))) {
          loseStreaks.push(losses);
          losses = 0;
        } else if (game.Scores.some((x) => x.PlayerIds.has(player.PlayerId))) {
          losses++;
        } else {
          // Did not play, streak continues
        }
      }

      streakPlayers.push({ player, streak: Math.max(...loseStreaks) });
    }

    this.value = Math.max(0, ...streakPlayers.map((x) => x.streak));
    this.array = streakPlayers.filter((x) => x.streak > 0 && x.streak === this.value).map((x) => x.player);
  }
}
