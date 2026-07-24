import { TagEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyFavoriteCharacter extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🙋', '🙋‍♂️', '🙋‍♀️'], 'The Favorite', ['Pick Me!'], 'Most picked character');
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

    this.applyValues(characters);
  }
}
