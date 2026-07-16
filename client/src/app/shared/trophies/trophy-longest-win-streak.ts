import { PlayerEntity } from 'libs/index';
import { ApplyObj, ITrophy } from './trophy.model';

export class TrophyLongestWinStreak extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🔥'], 'The Hot Streak', ['Try to keep up'], 'Longest Win Streak');
  }

  calculate(players: PlayerEntity[]) {
    const streakPlayers: ApplyObj = [];

    for (const player of players) {
      let maxStreak = 0;
      let streak = 0;
      player.PlayerGames.forEach((pg) => {
        if (pg.Won) {
          streak++;
        } else {
          maxStreak = Math.max(maxStreak, streak);
          streak = 0;
        }
      });
      maxStreak = Math.max(maxStreak, streak);

      streakPlayers.push({ item: player, count: maxStreak });
    }

    this.applyValues(streakPlayers);
  }
}
