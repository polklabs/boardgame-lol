import { PlayerEntity, TagEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyPlayerIsRole extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      ['😎'],
      'The {role}',
      ['One and the same'],
      'Most common player to be most common role.',
    );
  }

  calculate(api: ApiService) {
    const roles = new Map<TagEntity, number>();

    for (const game of api.games.list) {
      for (const pg of game.Scores) {
        pg.Tags.filter((t) => t.Category === 'role').forEach((t) =>
          roles.set(t, (roles.get(t) ?? 0) + 1),
        );
      }
    }
    this.applyValues(roles, 1);

    if (this.array.length === 1) {
      // continue
    } else {
      return;
    }

    const role = this.array[0] as TagEntity;
    const players = new Map<PlayerEntity, number>();

    for (const player of api.players.list) {
      players.set(
        player,
        player.PlayerGames.reduce((prev, pg) => prev + pg.Tags.filter((t) => t === role).length, 0),
      );
    }

    this.applyValues(players, 1);

    if (this.array.length === 1) {
      const player = this.array[0] as PlayerEntity;

      this.extra['role'] = role.Text;
      this.extra['player'] = player.ShortName ?? '';

      this.array = [player, 'is the', role];
    } else {
      // Finish
    }
  }
}
