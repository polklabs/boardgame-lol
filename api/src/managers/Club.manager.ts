import { DbService } from 'src/services/db.service';
import { BaseManager } from './Base.manager';
import { newGuid } from 'libs/utils/guid-utils';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { BoardGameEntity, ClubEntity, ClubUserEntity, GameEntity, PlayerEntity, TP, UserEntity } from 'libs/index';
import { ClubUserManager } from './ClubUser.manager';

@Injectable()
export class ClubManager extends BaseManager<ClubEntity> {
  constructor(
    protected db: DbService,
    protected clubUserManager: ClubUserManager,
  ) {
    super(ClubEntity);
  }

  loadManyWithName(userId = ''): ClubEntity[] {
    return this.db.AllRaw<ClubEntity>(
      `SELECT ${TP(ClubEntity, '*')},
            (SELECT COUNT(*) FROM ${TP(PlayerEntity)} WHERE ${TP(PlayerEntity, 'ClubId')} = ${TP(ClubEntity, 'ClubId')}) AS PlayerCount,
            (SELECT COUNT(*) FROM ${TP(GameEntity)} WHERE ${TP(GameEntity, 'ClubId')} = ${TP(ClubEntity, 'ClubId')}) AS GameCount,
            (SELECT COUNT(*) FROM ${TP(BoardGameEntity)} WHERE ${TP(BoardGameEntity, 'ClubId')} = ${TP(ClubEntity, 'ClubId')}) AS BoardGameCount,
            ${TP(UserEntity, 'Username')} as CreatedBy
          FROM ${TP(ClubEntity)}
          INNER JOIN ${TP(ClubUserEntity)} ON ${TP(ClubUserEntity, 'ClubId')} = ${TP(ClubEntity, 'ClubId')}
          INNER JOIN ${TP(UserEntity)} ON ${TP(UserEntity, 'UserId')} = ${TP(ClubEntity, 'CreatedBy')}
          WHERE ${TP(ClubUserEntity, 'UserId')} = ? OR ${TP(ClubEntity, 'Public')} = ?`,
      [userId, '1'],
    );
  }

  put(userId: string, entity: ClubEntity) {
    entity = this.new(entity);
    entity.ClubId = newGuid();

    this.SanitizeInputs(entity);
    this.Validate(entity);

    const transactions: unknown[] = [];

    const clubUser = new ClubUserEntity({
      ClubUserId: newGuid(),
      Admin: true,
      ClubId: entity.ClubId,
      UserId: userId,
    });

    transactions.push(this.clubUserManager.runInsert(userId, clubUser, true));

    this.CheckForeignKeys(entity);

    this.runInsert(userId, entity, false, transactions);

    return this.loadOne(entity.ClubId);
  }

  patch(userId: string, entity: ClubEntity) {
    entity = this.new(entity);
    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.runUpdate(userId, entity);

    return this.loadOne(entity.ClubId);
  }

  delete(clubId: string, primaryId: string) {
    this.clubUserManager.hasAccess(clubId, primaryId);

    this.runDelete(primaryId, undefined);
  }

  public Validate(entity: ClubEntity): string[] {
    const errors = super.Validate(entity);

    // Other validation checks

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
