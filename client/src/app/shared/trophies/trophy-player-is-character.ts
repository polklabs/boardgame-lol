import { PlayerEntity, TagEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyPlayerIsCharacter extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      ['😎'],
      '{character}',
      ['One and the same'],
      'Most common player to player as most common character.',
    );
  }

  calculate(api: ApiService) {
    const characters = new Map<TagEntity, number>();

    for (const game of api.games.list) {
      for (const pg of game.Scores) {
        pg.Tags.filter((t) => t.Category === 'character').forEach((t) =>
          characters.set(t, (characters.get(t) ?? 0) + 1),
        );
      }
    }
    this.applyValues(characters, 1);

    if (this.array.length === 1) {
      // continue
    } else {
      return;
    }

    const character = this.array[0] as TagEntity;
    const players = new Map<PlayerEntity, number>();

    for (const player of api.players.list) {
      players.set(
        player,
        player.PlayerGames.reduce((prev, pg) => prev + pg.Tags.filter((t) => t === character).length, 0),
      );
    }

    this.applyValues(players, 1);

    if (this.array.length === 1) {
      const player = this.array[0] as PlayerEntity;

      this.extra['character'] = character.Text;
      this.extra['player'] = player.ShortName ?? '';

      this.array = [player, 'is', character];
    } else {
      // Finish
    }
  }
}
