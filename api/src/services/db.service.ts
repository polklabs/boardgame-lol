import { Database } from 'better-sqlite3';
import { BadRequestException, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { BaseEntity, TPRaw, VAR } from 'libs/index';

type NullString = string | null;
export type DbVars = NullString | NullString[] | { [key: string]: NullString };

@Injectable()
export class DbService implements OnApplicationShutdown {
  private db?: Database;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.db = require('better-sqlite3')(process.env.DB_PATH, {}) as Database;
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    console.log('SQLite DB opened in WAL mode');
  }

  onApplicationShutdown() {
    try {
      if (this.db) {
        this.db.pragma('optimize');
        this.db.pragma('wal_checkpoint(TRUNCATE)');
        this.db.close();
        console.log('SQLite DB optimized, checkpointed, and closed');
      } else {
        // Nothing to close
      }
    } catch (err) {
      console.error('Error closing DB:', err);
    }
  }

  getDb(): Database | undefined {
    return this.db;
  }

  All<T>(query: string, vars: DbVars, constructorFn: (data: any) => T): T[] {
    const data = this.AllRaw<T>(query, vars);
    return data.map((item) => constructorFn(item));
  }

  AllRaw<T>(query: string, vars: DbVars): T[] {
    const db = this.getDb();
    if (!db) {
      return [];
    } else {
      // continue
    }

    const data = db.prepare(query).all(vars) as T[];

    if (!data || !Array.isArray(data)) {
      // Handle the case when db.all doesn't return the expected array
      return [];
    } else {
      // continue
    }

    return data;
  }

  Get<T>(query: string, vars: DbVars, constructorFn: (data: any) => T): T | undefined {
    const data = this.GetRaw<T>(query, vars);

    if (!data) {
      return undefined;
    } else {
      // continue
    }

    return constructorFn(data);
  }

  GetRaw<T>(query: string, vars: DbVars): T | undefined {
    const db = this.getDb();
    if (!db) {
      return undefined;
    } else {
      // continue
    }

    return db.prepare(query).get(vars) as T | undefined;
  }

  Insert<T extends BaseEntity>(
    tableName: string,
    entity: T,
    transaction: boolean,
    transactions: any[],
    runTransactionsFirst: boolean,
  ): any {
    const db = this.getDb();
    if (!db) {
      return;
    } else {
      // continue
    }

    const { values, keys } = entity.getDbValues();
    const valuePlaceholder = keys.map(VAR);

    const queryString = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${valuePlaceholder.join(', ')})`;

    return this.completeQuery(queryString, values, transaction, transactions, runTransactionsFirst);
  }

  Update<T extends BaseEntity>(
    tableName: string,
    primaryKeys: (keyof T)[],
    secondaryKey: keyof T | undefined,
    entity: T,
    transaction: boolean,
    transactions: any[],
    runTransactionsFirst: boolean,
  ): any {
    const db = this.getDb();
    if (!db) {
      return;
    } else {
      // continue
    }

    const PkValues = primaryKeys.map((p) => entity[p] as any);
    const { values, keys } = entity.getDbValues(primaryKeys);
    const keyValuePlaceholder = keys.map((key) => `${key} = ${VAR(key)}`);

    const pkQuery = primaryKeys.map((p) => TPRaw(tableName, String(p), 'where')).join(' AND ');
    let queryString = `UPDATE ${tableName} SET ${keyValuePlaceholder.join(', ')} WHERE ${pkQuery}`;

    const parameterValues = [...values, ...PkValues];
    if (secondaryKey) {
      const secondaryKeyValue = entity[secondaryKey] as any;
      parameterValues.push(secondaryKeyValue);
      queryString += ` AND ${TPRaw(tableName, secondaryKey, 'where')}`;
    } else {
      // continue
    }

    return this.completeQuery(queryString, parameterValues, transaction, transactions, runTransactionsFirst);
  }

  Delete(
    tableName: string,
    primaryKeys: string[],
    primaryKeyValues: string[],
    secondaryKey: string | undefined,
    secondaryKeyValue: string | undefined,
    transaction: boolean,
    transactions: any[],
    runTransactionsFirst: boolean,
  ): any {
    const db = this.getDb();
    if (!db) {
      return;
    } else {
      // continue
    }

    if (primaryKeys.length !== primaryKeyValues.length) {
      throw new BadRequestException(`Key length error: ${primaryKeys.length} !== ${[primaryKeyValues.length]}`);
    } else {
      // Continue
    }

    const pkString = primaryKeys.map((pk) => `${pk} = ${VAR(pk)}`).join(' AND ');
    let queryString = `DELETE FROM ${tableName} WHERE ${pkString}`;

    const parameterValues: any[] = [...primaryKeyValues];
    if (secondaryKey) {
      parameterValues.push(secondaryKeyValue);
      queryString += ` AND ${String(secondaryKey)} = unhex(?)`;
    } else {
      // continue
    }

    return this.completeQuery(queryString, parameterValues, transaction, transactions, runTransactionsFirst);
  }

  /**
   * Run transaction on it's own
   * @param transactions Array of transactions to run
   */
  Transact(transactions: any[]) {
    const db = this.getDb();
    if (!db) {
      return;
    } else {
      // continue
    }

    const trans = db.transaction(() => {
      transactions.forEach((t) => t());
    });

    trans();
  }

  private completeQuery(
    queryString: string,
    parms: any[],
    transaction: boolean,
    transactions: any[],
    runTransactionsFirst: boolean,
  ) {
    const db = this.getDb();
    if (!db) {
      return;
    } else {
      // continue
    }

    const del = db.prepare(queryString);

    const trans = db.transaction(() => {
      if (runTransactionsFirst) {
        transactions.forEach((t) => t());
        del.run(parms);
      } else {
        del.run(parms);
        transactions.forEach((t) => t());
      }
    });

    if (transaction) {
      return trans;
    } else {
      trans();
    }
  }
}
