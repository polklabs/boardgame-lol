import { GameEntity, PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyComebackKid extends ITrophy {
  constructor() {
    super('🕺', 'The Comeback Kid', ["Can't keep a good player down"], 'Max # of games played between wins.');
  }

  calculate(players: PlayerEntity[], games: GameEntity[]) {
    const streakPlayers: { player: PlayerEntity; streak: number }[] = [];

    for (const player of players) {
      const loseStreaks: number[] = [];
      let losses = 0;
      for (const game of games) {
        if (game.place(0).some((x) => x.PlayerId === player.PlayerId)) {
          loseStreaks.push(losses);
          losses = 0;
        } else if (game.Scores.some((x) => x.PlayerId === player.PlayerId)) {
          losses++;
        } else {
          // Did not play, streak continues
        }
      }

      streakPlayers.push({ player, streak: Math.max(...loseStreaks) });
    }

    this.value = Math.max(0, ...streakPlayers.map((x) => x.streak));
    this.array = streakPlayers.filter((x) => x.streak === this.value).map((x) => x.player);
  }
}
