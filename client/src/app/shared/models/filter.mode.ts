import { addDays, format, isAfter, isBefore } from 'date-fns';
import { BoardGameEntity, GameEntity, MinMax, Nullable, PlayerEntity, TagEntity } from 'libs/index';
import { PlayerGamePlayerEntity } from 'libs/models/PlayerGamePlayer.entity';

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export class FilterModel {
  enabled: boolean = false;

  @MinMax(1, undefined, 'array')
  playerIds: string[] = [];

  @MinMax(1, undefined, 'array')
  boardGameIds: string[] = [];

  @MinMax(1, undefined, 'array')
  daysOfWeek: string[] = [...DAYS_OF_WEEK];

  @Nullable()
  excludedTagIds: string[] = [];

  @Nullable()
  startDate: Date | null = null;

  @Nullable()
  endDate: Date | null = null;

  private playerIdSet = new Set<string>();
  private boardGameIdSet = new Set<string>();
  private daysOfWeekSet = new Set<string>();
  private excludedTagIdSet = new Set<string>();

  constructor(partial: Partial<FilterModel>) {
    this.assign(partial);
  }

  includePlayer(player: PlayerEntity | PlayerGamePlayerEntity) {
    return this.playerIdSet.has(player.PlayerId);
  }
  includeBoardGame(boardGame: BoardGameEntity | GameEntity | null) {
    return this.boardGameIdSet.has(boardGame?.BoardGameId ?? '');
  }
  includeDayOfWeek(date: Date) {
    return this.daysOfWeekSet.has(format(date, 'cccc'));
  }
  includeExcludedTag(tags: TagEntity[]) {
    return !tags.some((t) => this.excludedTagIdSet.has(t.TagId));
  }
  includeStartDate(date: Date) {
    return this.startDate === null || isAfter(addDays(date, 1), this.startDate);
  }
  includeEndDate(date: Date) {
    return this.endDate === null || isBefore(addDays(date, -1), this.endDate);
  }

  updateSets() {
    this.playerIdSet = new Set(this.playerIds);
    this.boardGameIdSet = new Set(this.boardGameIds);
    this.daysOfWeekSet = new Set(this.daysOfWeek);
    this.excludedTagIdSet = new Set(this.excludedTagIds);
  }

  reset() {
    this.assign({});
  }

  assign(partial: Partial<FilterModel>) {
    this.enabled = partial.enabled ?? false;
    this.playerIds = partial.playerIds ?? [];
    this.boardGameIds = partial.boardGameIds ?? [];
    this.daysOfWeek = partial.daysOfWeek ?? [...DAYS_OF_WEEK];
    this.excludedTagIds = partial.excludedTagIds ?? [];
    this.startDate = partial.startDate ?? null;
    this.endDate = partial.endDate ?? null;
    this.updateSets();
  }
}
