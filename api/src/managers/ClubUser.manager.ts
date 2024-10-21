import { DbService } from 'src/services/db.service';
import { BaseManager } from './Base.manager';
import { Injectable } from '@nestjs/common';
import { isGuid, newGuid } from 'libs/utils/guid-utils';
import { ValidationError } from 'src/errors/validation.error';
import { AuthorizationError } from 'src/errors/authorization.error';
import { ClubUserEntity, ClubEntity, TP, T } from 'libs/index';

@Injectable()
export class ClubUserManager extends BaseManager<ClubUserEntity> {
  constructor(protected db: DbService) {
    super(ClubUserEntity);
  }

  public hasAccess(userId: string | null, clubId: string | null) {
    if (clubId === null) {
      return false;
    } else {
      // continue
    }

    if (isGuid(userId) && isGuid(clubId)) {
      const data = this.loadManyCustom('', `WHERE ClubUser.UserId = ? AND ClubUser.ClubId = ? LIMIT 1`, [
        userId,
        clubId,
      ]);
      if (data.length <= 0) {
        throw new AuthorizationError('You do not have access to modify this club');
      } else {
        // continue
      }
    } else {
      throw new AuthorizationError('You do not have access to modify this club');
    }
  }

  public hasAdminAccess(userId: string, clubId: string | null) {
    if (isGuid(userId) && isGuid(clubId)) {
      const data = this.loadManyCustom(
        '',
        `WHERE ClubUser.UserId = ? AND ClubUser.ClubId = ? AND ClubUser.Admin = ? LIMIT 1`,
        [userId, clubId!, '1'],
      );
      if (data.length <= 0) {
        throw new AuthorizationError('You do not have access to modify this club');
      } else {
        // continue
      }
    } else {
      throw new AuthorizationError('You do not have access to modify this club');
    }
  }

  loadManyWithName(userId: string): (ClubUserEntity & ClubEntity)[] {
    return this.db.AllRaw<ClubUserEntity & ClubEntity>(
      `SELECT ${TP(ClubEntity, 'ClubId')}, ${TP(ClubEntity, 'Name')}
        FROM ${T(ClubUserEntity)}
        INNER JOIN ${T(ClubEntity)} ON ${TP(ClubEntity, 'ClubId')} = ${TP(ClubUserEntity, 'ClubId')}
        WHERE ${TP(ClubUserEntity, 'UserId')} = ?`,
      [userId],
    );
  }

  loadManyWithAdmin(userId: string): (ClubUserEntity & ClubEntity)[] {
    return this.db.AllRaw<ClubUserEntity & ClubEntity>(
      `SELECT ${TP(ClubEntity, 'ClubId')}
        FROM ${T(ClubUserEntity)}
        WHERE ${TP(ClubUserEntity, 'UserId')} = ? AND ${TP(ClubUserEntity, 'Admin')} = ?`,
      [userId, '1'],
    );
  }

  put(userId: string, entity: ClubUserEntity) {
    entity = this.new(entity);
    entity.ClubUserId = newGuid();

    if (entity.UserId === userId) {
      throw new ValidationError(['You cannot add your own access']);
    } else {
      // continue
    }

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.hasAdminAccess(userId, entity.ClubUserId);

    this.runInsert(userId, entity);

    return this.loadOne(entity.ClubUserId);
  }

  patch(userId: string, entity: ClubUserEntity) {
    entity = this.new(entity);

    if (entity.UserId === userId) {
      throw new ValidationError(['You cannot edit your own access']);
    } else {
      // continue
    }

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.hasAdminAccess(userId, entity.ClubId);

    this.runUpdate(userId, entity);

    return this.loadOne(entity.ClubUserId);
  }

  delete(userId: string, primaryId: string, secondaryId: string) {
    this.hasAdminAccess(userId, secondaryId);

    const row = this.loadOne(primaryId);

    if (row === undefined || row.UserId === userId) {
      throw new ValidationError(['You cannot delete your own access']);
    } else {
      // continue
    }

    this.runDelete(primaryId, secondaryId);
  }

  public Validate(entity: ClubUserEntity): string[] {
    const errors = super.Validate(entity);

    // Other validation checks

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
