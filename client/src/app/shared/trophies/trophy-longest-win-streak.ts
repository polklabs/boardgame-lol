import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyLongestWinStreak extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🔥'], 'The Hot Streak', ['Try to keep up'], 'Longest Win Streak');
  }

  calculate(api: ApiService) {
    const streakPlayers = new Map<PlayerEntity, number>();

    for (const player of api.players.list) {
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

      streakPlayers.set(player, maxStreak);
    }

    this.applyValues(streakPlayers);
  }
}
