import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';
import { tagFilter } from '../helpers/data.helper';

export class TrophyFavoriteGameVersion extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['📚'], 'The Expansion', ['Not So Vanilla'], 'Most played non vanilla game version');
  }

  calculate(api: ApiService) {
    const versionTags = new Map<string, number>();

    for (const game of api.games.list) {
      tagFilter(game.Tags, 'version').forEach((t) => {
        const id = `${game.BoardGameId};${t.TagId}`;
        versionTags.set(id, (versionTags.get(id) ?? 0) + 1);
      });
    }

    this.applyValues(versionTags, 1);

    this.array = this.array.flatMap((k) => {
      const [bgId, tagId] = k.split(';');
      const game = api.boardGames.getOne(bgId);
      const tag = api.tags.getOne(tagId);

      return [game, tag];
    });
  }
}
