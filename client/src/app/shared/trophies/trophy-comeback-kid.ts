import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyComebackKid extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      ['🕺', '💃'],
      'The Comeback Kid',
      ["Can't keep a good player down", "Guess who's back? Back again", 'Bringing boardgames back'],
      'Max # of games played between wins.',
    );
  }

  calculate(api: ApiService) {
    const streakPlayers = new Map<PlayerEntity, number>();

    for (const player of api.players.list) {
      const loseStreaks: number[] = [];
      let losses = 0;
      for (const pg of player.PlayerGames) {
        if (pg.Game?.place(0).some((x) => x.PlayerIds.has(player.PlayerId))) {
          loseStreaks.push(losses);
          losses = 0;
        } else if (pg.Game?.Scores.some((x) => x.PlayerIds.has(player.PlayerId))) {
          losses++;
        } else {
          // Did not play, streak continues
        }
      }

      streakPlayers.set(player, Math.max(...loseStreaks));
    }

    this.applyValues(streakPlayers);
  }
}
