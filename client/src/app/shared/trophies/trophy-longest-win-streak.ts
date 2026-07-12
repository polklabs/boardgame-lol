import { GameEntity, PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyLongestWinStreak extends ITrophy {
  constructor() {
    super('🔥', 'The Hot Streak', ['Try to keep up'], 'Longest Win Streak');
  }

  calculate(players: PlayerEntity[], games: GameEntity[]) {
    const streakPlayers: { player: PlayerEntity; streak: number }[] = [];

    for (const player of players) {
      let maxStreak = 0;
      let streak = 0;
      for (const game of games) {
        if (game.Winners.some((x) => x.PlayerId === player.PlayerId)) {
          streak++;
        } else if (game.Scores.some((x) => x.PlayerId === player.PlayerId)) {
          maxStreak = Math.max(maxStreak, streak);
          streak = 0;
        } else {
          // Did not play, streak continues
        }
      }

      streakPlayers.push({ player, streak: maxStreak });
    }

    this.value = Math.max(...streakPlayers.map((x) => x.streak));
    this.array = streakPlayers.filter((x) => x.streak === this.value).map((x) => x.player);
  }
}
