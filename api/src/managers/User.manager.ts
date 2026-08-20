import { DbService } from 'src/services/db.service';
import { BaseManager } from './Base.manager';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { UserEntity } from 'libs/models/User.entity';
import { newGuid, TP, TW } from 'libs/index';

const usernameRegex = /^(?=.{4,32}$)(?![_.-])(?!.*[_.]{2})[a-z0-9._-]+(?<![_.-])$/;

@Injectable()
export class UserManager extends BaseManager<UserEntity> {
  constructor(protected db: DbService) {
    super(UserEntity);
  }

  public Validate(userId: string, entity: UserEntity): string[] {
    const errors = super.Validate(userId, entity);

    // Only allow [a-z, 0-9, -, _] in username
    if (usernameRegex.test(entity.Username) === false) {
      errors.push(`Username must be 4-32 characters and only contain a-z1-3._-`);
    } else {
      // continue
    }

    if (this.isUsernameUnique(entity.Username) === false) {
      errors.push(`Username is not unique`);
    } else {
      // continue
    }

    if (this.isEmailUnique(entity.Email) === false) {
      errors.push(`An account with this email already exists`);
    } else {
      // continue
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }

  public getUser(userId: string) {
    return this.db.Get(
      `SELECT ${this.getSelectAll()} FROM ${TP(UserEntity)} WHERE ${TW(UserEntity, 'UserId')} LIMIT 1`,
      [userId],
      this.new,
    );
  }

  public findUser(username: string) {
    username = username.toLowerCase().trim();
    return this.db.Get(
      `SELECT ${this.getSelectAll()} FROM  ${TP(UserEntity)} WHERE ${TW(UserEntity, 'Email')} OR ${TW(UserEntity, 'Username')} LIMIT 1`,
      [username, username],
      this.new,
    );
  }

  public isEmailUnique(email: string) {
    email = email.toLowerCase().trim();
    return (
      this.db.GetRaw<{ count: number }>(
        `SELECT COUNT(*) AS count FROM ${TP(UserEntity)} WHERE ${TW(UserEntity, 'Email')} LIMIT 1`,
        email,
      )?.count === 0
    );
  }

  public isUsernameUnique(username: string) {
    username = username.trim();
    return (
      this.db.GetRaw<{ count: number }>(
        `SELECT COUNT(*) AS count FROM ${TP(UserEntity)} WHERE ${TW(UserEntity, 'Username')} LIMIT 1`,
        username,
      )?.count === 0
    );
  }

  put(userId: string, entity: UserEntity) {
    entity = this.new({
      ...entity,
      UserId: newGuid(),
      Username: entity.Username.toLowerCase(),
      Email: entity.Email.toLowerCase(),
    });

    this.Validate(userId, entity);

    this.runInsert(userId, entity);
  }
}
