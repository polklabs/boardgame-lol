import { DbService, DbVars } from 'src/services/db.service';
import { getForeignKey, getForeignKeys } from 'libs/decorators/foreign-key.decorator';
import { MinMax, getMinMax } from 'libs/decorators/min-max.decorator';
import { getNullable } from 'libs/decorators/nullable.decorator';
import { getPrimaryKeys } from 'libs/decorators/primary-key.decorator';
import { getTableName } from 'libs/decorators/table-name.decorator';
import { BaseEntity } from 'libs/models/Base.entity';
import { isGuid } from 'libs/utils/guid-utils';
import { EnumValue, getEnum } from 'libs/decorators/enum.decorator';
import { getSecondaryKey } from 'libs/decorators/secondary-key.decorator';
import { ValidationError } from 'src/errors/validation.error';
import { SanitizeTags, getSanitize } from 'libs/decorators/sanitize.decorator';
import sanitizeHtml from 'sanitize-html';
import { getIgnore } from 'libs/decorators/ignore.decorator';
import { BadRequestException } from '@nestjs/common';

export abstract class BaseManager<T extends BaseEntity> {
  protected abstract db: DbService;

  public readonly new: (data: T) => T;

  protected primaryKeys: (keyof T)[];
  protected secondaryKey: keyof T | undefined;
  protected tableName: string;
  protected foreignKeys: (keyof T)[];
  protected nullable: (keyof T)[];
  protected ignore: (keyof T)[];
  protected minMaxes: MinMax;
  protected enums: EnumValue;
  protected sanitize: SanitizeTags;

  constructor(entityType: new (partial: Partial<T>) => T) {
    this.new = (data: T) => new entityType(data);

    this.primaryKeys = getPrimaryKeys(entityType) as (keyof T)[];
    this.secondaryKey = getSecondaryKey(entityType) as keyof T;
    this.tableName = getTableName(entityType) as string;
    this.foreignKeys = getForeignKeys(entityType) as (keyof T)[];
    this.nullable = getNullable(entityType) as (keyof T)[];
    this.ignore = getIgnore(entityType) as (keyof T)[];
    this.minMaxes = getMinMax(entityType) as MinMax;
    this.enums = getEnum(entityType) as EnumValue;
    this.sanitize = getSanitize(entityType) as SanitizeTags;
  }

  private getBaseSelect() {
    return `
      SELECT 
        ${this.tableName}.*,
        User1.Username AS CreatedBy,
        User2.Username AS LastModifiedBy
      FROM ${this.tableName}
      `;
  }

  private getBaseJoin() {
    return `
      INNER JOIN User AS User1 ON User1.UserId = ${this.tableName}.CreatedBy
      INNER JOIN User AS User2 ON User2.UserId = ${this.tableName}.LastModifiedBy
    `;
  }

  loadAll(): T[] {
    return this.db.All(`${this.getBaseSelect()}${this.getBaseJoin()}`, [], this.new);
  }

  /**
   * Load many rows filtered by target and optional second target
   * @param target Entity with PrimaryKey or column name
   * @param targetId Guid for target
   * @param secondaryTarget Entity with PrimaryKey or column name
   * @param secondaryTargetId Guid for secondary target
   * @returns All rows that match foreign keys
   */
  loadMany<K, M>(
    target: (new (partial: Partial<K>) => K) | keyof T,
    targetIds: string | null | (string | null)[],
    secondaryTarget?: (new (partial: Partial<M>) => M) | keyof T,
    secondaryTargetIds?: string | null | (string | null)[],
  ): T[] {
    targetIds = Array.isArray(targetIds) ? targetIds : [targetIds];
    if (secondaryTargetIds) {
      secondaryTargetIds = Array.isArray(secondaryTargetIds) ? secondaryTargetIds : [secondaryTargetIds];
    } else {
      secondaryTargetIds = [];
    }

    let targetPKs: string;
    let expectedPkCount = 0;
    if (typeof target === 'string') {
      targetPKs = `${this.tableName}.${target} = ?`;
      expectedPkCount = 1;
    } else {
      const pks = getPrimaryKeys(target);
      targetPKs = pks.map((p) => `${this.tableName}.${p} = ?`).join(' AND ');
      expectedPkCount = pks.length;
    }

    if (expectedPkCount !== targetIds.length) {
      throw new BadRequestException(`Key length error: ${expectedPkCount} !== ${[targetIds.length]}`);
    } else {
      // Continue
    }

    let query = `${this.getBaseSelect()}${this.getBaseJoin()} WHERE ${targetPKs}`;
    const vars = targetIds;

    if (secondaryTarget && (secondaryTargetIds?.length ?? 0) > 0 && secondaryTargetIds?.every((x) => x !== null)) {
      if (typeof secondaryTarget === 'string') {
        query += ` AND ${this.tableName}.${secondaryTarget} = ?`;
      } else {
        const spks = getPrimaryKeys(secondaryTarget);
        query += spks.map((p) => ` AND ${this.tableName}.${p} = ?`).join('');
      }

      vars.push(...secondaryTargetIds);
    } else {
      // No secondary key
    }

    return this.db.All(query, vars, this.new);
  }

  loadManyCustom<K = T>(customJoin: string, customWhere: string, vars: DbVars): K[] {
    return this.db.All(
      `${this.getBaseSelect()}
      ${this.getBaseJoin()}
      ${customJoin}
      ${customWhere}`,
      vars,
      this.new,
    ) as unknown as K[];
  }

  loadOne(ids: string | null | (string | null)[]): T | undefined {
    ids = Array.isArray(ids) ? ids : [ids];

    if (this.primaryKeys.length !== ids.length) {
      throw new BadRequestException(`Key length error: ${this.primaryKeys.length} !== ${[ids.length]}`);
    } else {
      // Continue
    }

    if (ids.includes(null)) {
      return undefined;
    } else {
      const query = this.primaryKeys.map((p) => `${this.tableName}.${String(p)} = ?`).join(' AND ');
      return this.db.Get(
        `${this.getBaseSelect()}
      ${this.getBaseJoin()}
      WHERE ${query} LIMIT 1`,
        ids,
        this.new,
      );
    }
  }

  /**
   * Run db insert with optional transaction
   * @param userId User making the changes
   * @param entity entity to insert
   * @param transaction false
   * @param transactions []
   * @param runTransactionsFirst False
   * @returns db transaction if transaction is true
   */
  runInsert(userId: string, entity: T, transaction = false, transactions: any[] = [], runTransactionsFirst = false) {
    if (!this.tableName) {
      return;
    } else {
      // Continue
    }

    this.ignore.forEach((key) => {
      delete entity[key];
    });

    entity.CreatedBy = userId;
    entity.CreatedDate = new Date().toISOString();
    entity.LastModifiedBy = userId;
    entity.LastModifiedDate = new Date().toISOString();

    return this.db.Insert(this.tableName, entity, transaction, transactions, runTransactionsFirst);
  }

  runUpdate(userId: string, entity: T, transaction = false, transactions: any[] = [], runTransactionsFirst = false) {
    if (!this.tableName || this.primaryKeys.length <= 0) {
      return;
    } else {
      // Continue
    }

    this.ignore.forEach((key) => {
      delete entity[key];
    });

    // Delete these values since they must already exist
    delete entity['CreatedDate'];
    delete entity['CreatedBy'];
    entity.LastModifiedBy = userId;
    entity.LastModifiedDate = new Date().toISOString();

    return this.db.Update(
      this.tableName,
      this.primaryKeys,
      this.secondaryKey,
      entity,
      transaction,
      transactions,
      runTransactionsFirst,
    );
  }

  runDelete(
    primaryIds: string | string[],
    secondaryId: string | undefined,
    transaction = false,
    transactions: any[] = [],
    runTransactionsFirst = false,
  ) {
    primaryIds = Array.isArray(primaryIds) ? primaryIds : [primaryIds];
    if (!this.tableName || this.primaryKeys.length <= 0) {
      return;
    } else {
      // continue
    }

    return this.db.Delete(
      this.tableName,
      this.primaryKeys.map(String),
      primaryIds,
      String(this.secondaryKey),
      secondaryId,
      transaction,
      transactions,
      runTransactionsFirst,
    );
  }

  CheckForeignKeys(entity: T) {
    if (this.secondaryKey) {
      for (const key of this.foreignKeys) {
        const fkValue = entity[key] as any;

        if (fkValue === null) {
          continue;
        } else {
          // continue
        }

        const skValue = entity[this.secondaryKey] as any;

        const fk = getForeignKey(entity, String(key));

        if ((fk?.primaryKeys.length ?? 0) > 1) {
          throw new ValidationError(['Too many primary keys', fk?.primaryKeys.join(',') ?? '']);
        } else {
          // Continue
        }

        if (fk?.tableName && fk.primaryKeys.length > 0 && fk.secondaryKey) {
          const result = this.db.GetRaw(`SELECT * FROM ${fk.tableName} WHERE ${fk.primaryKeys[0]} = ?`, [
            fkValue,
          ]) as any;
          if (result === undefined) {
            // Possibly from transaction
          } else {
            const fkSkValue = result[fk.secondaryKey];

            if (skValue !== fkSkValue) {
              throw new ValidationError(['Foreign Key table does not match']);
            } else {
              // continue
            }
          }
        } else {
          // continue
        }
      }
    } else {
      // continue
    }
  }

  SanitizeInputs(entity: T) {
    Object.keys(this.sanitize).forEach((key) => {
      const value = entity[key as keyof T];
      if (typeof value === 'string') {
        entity[key as keyof T] = sanitizeHtml(value, {
          allowedTags: this.sanitize[key],
          allowedAttributes: {},
        }) as T[keyof T];
      } else if (value !== null && value !== undefined) {
        console.warn(`Cannot sanitize, nullifying: ${String(key)}`);
        entity[key as keyof T] = null as T[keyof T];
      } else {
        // continue
      }
    });
  }

  Validate(entity: T): string[] {
    const errors: string[] = [];

    const keys = Object.keys(entity) as (keyof T)[];
    for (const key of keys) {
      const keyString = String(key);
      const value = entity[key];
      // Make sure non-nullable keys have values
      if (!this.nullable.includes(key) && !this.ignore.includes(key)) {
        if (value === null || value === undefined) {
          errors.push(`${keyString}: not nullable`);
        } else {
          // continue
        }
      } else {
        // nullable
      }

      if (value === null || value === undefined) {
        continue;
      } else {
        // keep going
      }

      // Check that all primary and foreign keys are valid Guids
      if (this.primaryKeys.includes(key) || key === this.secondaryKey || this.foreignKeys.includes(key)) {
        if (!isGuid(value.toString())) {
          errors.push(`${keyString}: not a valid guid`);
        } else {
          // continue
        }
      } else {
        // Not a guid
      }

      // Check min/max number or string length
      const minMax = this.minMaxes[keyString];
      if (minMax) {
        if (minMax.type === 'string') {
          if (String(value).length < minMax.min || String(value).length > minMax.max) {
            errors.push(`${keyString}: length must be >= ${minMax.min}, and <= ${minMax.max}`);
          } else {
            // continue
          }
        } else if (minMax.type === 'number') {
          if (+value < minMax.min || +value > minMax.max) {
            errors.push(`${keyString}: value must be >= ${minMax.min}, and <= ${minMax.max}`);
          } else {
            // continue
          }
        } else {
          errors.push(`${keyString}: ${minMax.type} cannot have MinMax decorator`);
        }
      } else {
        // continue
      }

      // Check enum types
      const enumValue = this.enums[keyString];
      if (enumValue) {
        if (!enumValue.includes(value.toString())) {
          errors.push(`${keyString}: must be one of ['${enumValue.join("', '")}']`);
        } else {
          // continue
        }
      } else {
        // continue
      }
    }

    return errors;
  }
}
