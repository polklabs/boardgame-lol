import { DbService } from 'src/services/db.service';
import { BaseManager } from './Base.manager';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { UserEntity } from 'libs/models/User.entity';
import { newGuid } from 'libs/index';

const usernameRegex = /^(?=.{4,32}$)(?![_.-])(?!.*[_.]{2})[a-zA-Z0-9._-]+(?<![_.-])$/;

@Injectable()
export class UserManager extends BaseManager<UserEntity> {
  constructor(protected db: DbService) {
    super(UserEntity);
  }

  public Validate(entity: UserEntity): string[] {
    const errors = super.Validate(entity);

    // Only allow [a-z, A-Z, 0-9, -, _] in username
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
    return this.db.GetRaw<UserEntity>(`SELECT * FROM  User WHERE UserId = ? LIMIT 1`, [userId]);
  }

  public findUser(username: string) {
    username = username.toLowerCase().trim();
    return this.db.GetRaw<UserEntity>(
      `SELECT * FROM  User WHERE Email = ? COLLATE NOCASE OR Username = ? COLLATE NOCASE LIMIT 1`,
      [username, username],
    );
  }

  public isEmailUnique(email: string) {
    email = email.toLowerCase().trim();
    return (
      this.db.GetRaw<{ count: number }>(
        `SELECT COUNT(*) AS count FROM User WHERE Email = ? COLLATE NOCASE LIMIT 1`,
        email,
      )?.count === 0
    );
  }

  public isUsernameUnique(username: string) {
    username = username.trim();
    return (
      this.db.GetRaw<{ count: number }>(
        `SELECT COUNT(*) AS count FROM User WHERE Username = ? COLLATE NOCASE LIMIT 1`,
        username,
      )?.count === 0
    );
  }

  put(userId: string, entity: UserEntity) {
    entity = this.new(entity);
    entity.UserId = newGuid();

    this.Validate(entity);

    this.runInsert(userId, entity);
  }
}
