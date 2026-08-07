import { DbService } from 'src/services/db.service';
import { BaseManager } from './Base.manager';
import { Injectable } from '@nestjs/common';
import { isGuid } from 'libs/utils/guid-utils';
import { ValidationError } from 'src/errors/validation.error';
import { AuthorizationError } from 'src/errors/authorization.error';
import { ClubUserEntity, TP, UserEntity } from 'libs/index';
import { UserManager } from './User.manager';

@Injectable()
export class ClubUserManager extends BaseManager<ClubUserEntity> {
  constructor(
    protected db: DbService,
    private userManager: UserManager,
  ) {
    super(ClubUserEntity);
  }

  public hasAccess(userId: string | null, clubId: string | null) {
    if (clubId === null) {
      return false;
    } else {
      // continue
    }

    if (isGuid(userId) && isGuid(clubId)) {
      const data = this.loadManyCustom(
        '',
        `WHERE ${TP(ClubUserEntity, 'UserId')} = ? AND ${TP(ClubUserEntity, 'ClubId')} = ? LIMIT 1`,
        [userId, clubId],
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

  public hasAdminAccess(userId: string, clubId: string | null) {
    if (isGuid(userId) && isGuid(clubId)) {
      const data = this.loadManyCustom(
        '',
        `WHERE ${TP(ClubUserEntity, 'UserId')} = ? AND ${TP(ClubUserEntity, 'ClubId')} = ? AND ${TP(ClubUserEntity, 'Admin')} = ? LIMIT 1`,
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

  loadManyWithUsername(clubId: string) {
    return this.db
      .AllRaw<ClubUserEntity>(
        `SELECT ${TP(ClubUserEntity, '*')},
            ${TP(UserEntity, 'Username')} as usernameEmail
          FROM ${TP(ClubUserEntity)}
          INNER JOIN ${TP(UserEntity)} ON ${TP(UserEntity, 'UserId')} = ${TP(ClubUserEntity, 'UserId')}
          WHERE ${TP(ClubUserEntity, 'ClubId')} = ?`,
        [clubId],
      )
      .map((x) => new ClubUserEntity(x));
  }

  put(userId: string, entity: ClubUserEntity) {
    const usernameEmail = entity.usernameEmail;
    entity = this.new(entity);

    if (!entity.UserId) {
      const user = this.userManager.findUser(usernameEmail);
      if (user) {
        // Continue
        entity.UserId = user.UserId;
      } else {
        throw new ValidationError([`User '${usernameEmail}' does not exist`]);
      }
    } else {
      // continue
    }

    this.SanitizeInputs(entity);
    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true);
  }

  patch(userId: string, entity: ClubUserEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true);
  }

  delete(userId: string, entity: ClubUserEntity) {
    this.Validate(userId, entity);

    return this.runDelete([entity.ClubId, entity.UserId], undefined, true);
  }

  public Validate(userId: string, entity: ClubUserEntity): string[] {
    const errors = super.Validate(userId, entity);

    // Other validation checks

    if (entity.UserId === userId) {
      errors.push('You cannot edit your own access');
    } else {
      // continue
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
