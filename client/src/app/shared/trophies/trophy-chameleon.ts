import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';
import { tagFilter } from '../helpers/data.helper';
import { PlayerEntity } from 'libs/index';

export class TrophyChameleon extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🦎'], 'The Chameleon', ['ACTING!'], 'Player with most distinct characters');
  }

  calculate(api: ApiService) {
    const characterTags = new Map<PlayerEntity, number>();

    for (const player of api.players.list) {
      characterTags.set(player, new Set(player.PlayerGames.flatMap((pg) => tagFilter(pg.Tags, 'character'))).size);
    }

    this.applyValues(characterTags);
  }
}
