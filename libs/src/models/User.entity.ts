import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { Exclude } from 'class-transformer';
import { Nullable } from '../decorators/nullable.decorator';
import { MinMax } from '../decorators/min-max.decorator';

@TableName('User')
export class UserEntity extends BaseEntity {
  @PrimaryKey
  UserId: string | null = null;

  @MinMax(4, 32, 'string')
  Username: string = '';

  @MinMax(3, 254, 'string')
  Email: string = '';

  EmailVerified = false;

  @Exclude()
  @Nullable()
  EmailVerificationCode: string | null = null;

  @Exclude()
  @Nullable()
  EmailVerificationCodeDateTime: string | null = null;

  @Exclude()
  @MinMax(8, 256, 'string')
  Password: string = '';

  @Exclude()
  @Nullable()
  PasswordResetCode: string | null = null;

  @Exclude()
  @Nullable()
  PasswordResetCodeDateTime: string | null = null;

  Deleted: boolean = false;

  constructor(partial: Partial<UserEntity> = {}, copyIgnored = false) {
    super(partial, UserEntity);
    this.assign(partial, UserEntity, copyIgnored);
  }

  calculateFields() {}
}
