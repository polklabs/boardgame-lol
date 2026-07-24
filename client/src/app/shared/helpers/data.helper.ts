import { GameEntity, PlayerGameEntity, TagCategory, TagCategoryMapping, TagEntity } from 'libs/index';
import { Column } from '../models/column.model';

export function isEmptyLike(value: unknown): boolean {
  if (value == null) {
    return true; // null or undefined
  } else if (typeof value === 'number' && value === 0) {
    return true;
  } else if (typeof value === 'string' && value.trim() === '') {
    return true;
  } else if (Array.isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

export function getTagColumns<
  T extends { Tags: TagEntity[] },
  K extends keyof (typeof TagCategoryMapping)[TagCategory] = keyof (typeof TagCategoryMapping)[TagCategory],
>(check: K) {
  return Object.entries(TagCategoryMapping)
    .filter((x) => x[1][check])
    .map(
      (tc) =>
        ({
          id: 'Tags',
          name: tc[1].text,
          dataType: 'tag',
          fieldFunc: (x) => tagFilter(x.Tags, tc[0] as TagCategory),
        }) as Column<T>,
    );
}

export function tagFilter(tags: TagEntity[], category: TagCategory): TagEntity[] {
  return tags.filter((t) => t.Category === category);
}

export function sortPlayerGames(playerGames: PlayerGameEntity[], game?: GameEntity): PlayerGameEntity[] {
  if (playerGames.length === 0) {
    return playerGames;
  } else {
    // Continue
  }
  const scoreType = game?.ScoreType ?? playerGames[0].Game?.ScoreType;
  playerGames.sort((a, b) => {
    let sortValue;
    switch (scoreType) {
      case 'rank':
        sortValue = (a.Points ?? Infinity) - (b.Points ?? Infinity);
        break;
      case 'points':
        sortValue = (b.VirtualPoints ?? 0) - (a.VirtualPoints ?? 0);
        break;
      case 'win-lose':
      default:
        sortValue = (b.Points ?? 0) - (a.Points ?? 0);
    }
    return sortValue || a.DisplayName.localeCompare(b.DisplayName);
  });
  return playerGames;
}
