import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';
import { tagFilter } from '../helpers/data.helper';

export class TrophyDuo extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🍒'], 'The Duo', ['My Brand'], 'Most common player and character combo');
  }

  calculate(api: ApiService) {
    const characterTags = new Map<string, number>();

    for (const pg of api.playerGames.list) {
      for (const player of pg.Players) {
        tagFilter(pg.Tags, 'character').forEach((t) => {
          const id = `${player.PlayerId};${t.TagId}`;
          characterTags.set(id, (characterTags.get(id) ?? 0) + 1);
        });
      }
    }

    this.applyValues(characterTags, 1);

    this.array = this.array.flatMap((k) => {
      const [playerId, tagId] = k.split(';');
      const game = api.players.getOne(playerId);
      const tag = api.tags.getOne(tagId);

      return [game, tag];
    });
  }
}
