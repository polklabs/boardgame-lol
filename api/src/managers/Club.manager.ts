import { DbService } from 'src/services/db.service';
import { BaseManager } from './Base.manager';
import { newGuid } from 'libs/utils/guid-utils';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import {
  BoardGameEntity,
  ClubEditReturn,
  ClubEntity,
  ClubUserEntity,
  GameEntity,
  PlayerEntity,
  TP,
  UserEntity,
} from 'libs/index';
import { ClubUserManager } from './ClubUser.manager';

@Injectable()
export class ClubManager extends BaseManager<ClubEntity> {
  constructor(
    protected db: DbService,
    protected clubUserManager: ClubUserManager,
  ) {
    super(ClubEntity);
  }

  loadManyWithAuth(userId?: string): ClubEntity[] {
    return this.db.AllRaw<ClubEntity>(
      `SELECT ${TP(ClubEntity, '*')},
            CASE WHEN ${TP(ClubUserEntity, 'UserId')} IS NOT NULL THEN 1 ELSE 0 END as CanEdit,
            CASE WHEN ${TP(ClubUserEntity, 'UserId')} IS NOT NULL THEN ${TP(ClubUserEntity, 'Admin')} ELSE 0 END as Admin,
            (SELECT COUNT(*) FROM ${TP(PlayerEntity)} WHERE ${TP(PlayerEntity, 'ClubId')} = ${TP(ClubEntity, 'ClubId')}) AS PlayerCount,
            (SELECT COUNT(*) FROM ${TP(GameEntity)} WHERE ${TP(GameEntity, 'ClubId')} = ${TP(ClubEntity, 'ClubId')}) AS GameCount,
            (SELECT COUNT(*) FROM ${TP(BoardGameEntity)} WHERE ${TP(BoardGameEntity, 'ClubId')} = ${TP(ClubEntity, 'ClubId')}) AS BoardGameCount,
            ${TP(UserEntity, 'Username')} as CreatedBy
          FROM ${TP(ClubEntity)}
          LEFT JOIN ${TP(ClubUserEntity)} ON ${TP(ClubUserEntity, 'ClubId')} = ${TP(ClubEntity, 'ClubId')} AND ${TP(ClubUserEntity, 'UserId')} = ?
          INNER JOIN ${TP(UserEntity)} ON ${TP(UserEntity, 'UserId')} = ${TP(ClubEntity, 'CreatedBy')}
          WHERE ${TP(ClubUserEntity, 'UserId')} IS NOT NULL OR ${TP(ClubEntity, 'Public')} = ?`,
      [userId ?? '', '1'],
    );
  }

  loadOneWithAuth(clubId: string, userId?: string): ClubEntity | undefined {
    return this.db.GetRaw<ClubEntity>(
      `SELECT ${TP(ClubEntity, '*')},
            CASE WHEN ${TP(ClubUserEntity, 'UserId')} IS NOT NULL THEN 1 ELSE 0 END as CanEdit,
            CASE WHEN ${TP(ClubUserEntity, 'UserId')} IS NOT NULL THEN ${TP(ClubUserEntity, 'Admin')} ELSE 0 END as Admin
          FROM ${TP(ClubEntity)}
          LEFT JOIN ${TP(ClubUserEntity)} ON ${TP(ClubUserEntity, 'ClubId')} = ${TP(ClubEntity, 'ClubId')} AND ${TP(ClubUserEntity, 'UserId')} = ?
          WHERE ${TP(ClubEntity, 'ClubId')} = ? LIMIT 1`,
      [userId ?? '', clubId],
    );
  }

  put(userId: string, entity: ClubEntity): ClubEditReturn {
    let users = entity.Users;
    const ClubId = newGuid();
    entity = this.new({ ...entity, ClubId });

    this.SanitizeInputs(entity);
    this.Validate(userId, entity);

    const transactions: unknown[] = [];

    // Filter out currently logged in user, we will recreate the entity
    users = users.filter((x) => x.UserId !== userId);
    users.push(
      new ClubUserEntity({
        Admin: true,
        ClubId,
        UserId: userId,
      }),
    );

    users.forEach((u) => {
      transactions.push(this.clubUserManager.put(userId, ClubId, u));
    });

    this.CheckForeignKeys(entity);

    this.runInsert(userId, entity, false, transactions);

    return {
      Club: this.loadOneWithAuth(entity.ClubId, userId)!,
      ClubUsers: this.clubUserManager.loadManyWithUsername(entity.ClubId),
    };
  }

  patch(userId: string, entity: ClubEntity): ClubEditReturn {
    let users = entity.Users;
    entity = this.new(entity);
    const clubId = entity.ClubId;

    let admin = false;
    try {
      this.clubUserManager.hasAdminAccess(userId, clubId);
      admin = true;
    } finally {
      // Continue
    }

    this.SanitizeInputs(entity);
    this.Validate(userId, entity);

    const transactions: unknown[] = [];

    if (admin) {
      const oldUsers = new Set(this.clubUserManager.loadMany('ClubId', clubId).map((x) => x.UserId));
      users = users.filter((x) => x.UserId !== userId);
      const toDelete = users.filter((x) => x.toDelete);
      users = users.filter((x) => !x.toDelete);
      users.forEach((u) => {
        if (oldUsers.has(u.UserId)) {
          transactions.push(this.clubUserManager.patch(userId, clubId, u));
        } else {
          transactions.push(this.clubUserManager.put(userId, clubId, u));
        }
      });
      toDelete.forEach((u) => {
        transactions.push(this.clubUserManager.delete(userId, clubId, u));
      });
    } else {
      // Cannot edit club users
    }

    this.runUpdate(userId, entity, false, transactions);

    return {
      Club: this.loadOneWithAuth(entity.ClubId, userId)!,
      ClubUsers: this.clubUserManager.loadManyWithUsername(entity.ClubId),
    };
  }

  delete(clubId: string) {
    this.runDelete(clubId, undefined);
  }

  public Validate(userId: string, entity: ClubEntity): string[] {
    const errors = super.Validate(userId, entity);

    // Other validation checks

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
