import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { UserEntity } from './User.entity';
import { Ignore } from '../decorators/ignore.decorator';
import { ClubEntity } from './Club.entity';

@TableName('ClubUser')
export class ClubUserEntity extends BaseEntity {
  @PrimaryKey()
  @ForeignKey(ClubEntity)
  ClubId: string = '';

  @PrimaryKey()
  @ForeignKey(UserEntity)
  UserId: string = '';

  Admin: boolean = false;

  @Ignore()
  toDelete = false;

  @Ignore()
  usernameEmail: string = '';

  @Ignore()
  calculated = false;

  constructor(partial: Partial<ClubUserEntity> = {}) {
    super();
    this.assign(partial, ClubUserEntity, true);
  }

  calculate(): void {
    this.calculated = true;
  }
}
