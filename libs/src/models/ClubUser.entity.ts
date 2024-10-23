import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { UserEntity } from './User.entity';

@TableName('ClubUser')
export class ClubUserEntity extends BaseEntity {
  @PrimaryKey
  ClubUserId: string | null = null;

  @SecondaryKey
  ClubId: string | null = null;

  @ForeignKey(UserEntity)
  UserId: string = '';

  Admin: boolean = false;

  constructor(partial: Partial<ClubUserEntity> = {}, copyIgnored = false) {
    super(partial, ClubUserEntity);
    this.assign(partial, ClubUserEntity, copyIgnored);
  }

  calculateFields() {}
}
