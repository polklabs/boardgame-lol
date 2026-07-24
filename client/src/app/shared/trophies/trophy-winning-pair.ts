import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';
import { tagFilter } from '../helpers/data.helper';

export class TrophyWinningPair extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🤞'], 'The Winning Pair', ['How do you do it?'], 'Most common character/victory combo');
  }

  calculate(api: ApiService) {
    const characterTags = new Map<string, number>();

    for (const pg of api.playerGames.list) {
      tagFilter(pg.Tags, 'character').forEach((tc) => {
        tagFilter(pg.Tags, 'victory-method').forEach((td) => {
          const id = `${tc.TagId};${td.TagId}`;
          characterTags.set(id, (characterTags.get(id) ?? 0) + 1);
        });
      });
    }

    this.applyValues(characterTags, 1);

    this.array = this.array.flatMap((k: string) => k.split(';').map((id) => api.tags.getOne(id)));
    if (this.array.length > 0) {
      this.array.splice(1, 0, 'won by');
    } else {
      // Skip
    }
  }
}
