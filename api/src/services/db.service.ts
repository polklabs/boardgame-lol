import { Database } from 'better-sqlite3';
import { Injectable } from '@nestjs/common';

type NullString = string | null;
export type DbVars = NullString | NullString[] | { [key: string]: NullString };

@Injectable()
export class DbService {
  private db?: Database;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.db = require('better-sqlite3')(process.env.DB_PATH, {}) as Database;
    this.db.pragma('journal_mode = WAL');
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

  Insert<T extends object>(
    tableName: string,
    entity: T,
    transaction: boolean,
    transactions: any[],
    runTransactionsFirst: boolean,
  ): any | undefined {
    const db = this.getDb();
    if (!db) {
      return;
    } else {
      // continue
    }

    const keys = Object.keys(entity);
    const valuePlaceholder = keys.map(() => '?');
    const values = keys.map((key) => {
      const value = (entity as any)[key];
      if (value === true) {
        return 1;
      } else if (value === false) {
        return 0;
      } else {
        return value;
      }
    });

    const queryString = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${valuePlaceholder.join()})`;

    const insert = db.prepare(queryString);

    const trans = db.transaction(() => {
      if (runTransactionsFirst) {
        transactions.forEach((t) => t());
        insert.run(values);
      } else {
        insert.run(values);
        transactions.forEach((t) => t());
      }
    });

    if (transaction) {
      return trans;
    } else {
      trans();
      return;
    }
  }

  Update<T extends object>(
    tableName: string,
    primaryKey: keyof T,
    secondaryKey: keyof T | undefined,
    entity: T,
    transaction: boolean,
    transactions: any[],
    runTransactionsFirst: boolean,
  ): any | undefined {
    const db = this.getDb();
    if (!db) {
      return;
    } else {
      // continue
    }

    const PkValue = entity[primaryKey] as any;
    const keys = Object.keys(entity).filter((key) => key !== primaryKey);
    const keyValuePlaceholder = keys.map((key) => `${key} = ?`);
    const values = keys.map((key) => {
      const value = (entity as any)[key];
      if (value === true) {
        return 1;
      } else if (value === false) {
        return 0;
      } else {
        return value;
      }
    });

    let queryString = `UPDATE ${tableName} SET ${keyValuePlaceholder.join(', ')} WHERE ${String(primaryKey)} = ?`;

    const parameterValues = [...values, PkValue];
    if (secondaryKey) {
      const secondaryKeyValue = entity[secondaryKey] as any;
      parameterValues.push(secondaryKeyValue);
      queryString += ` AND ${String(secondaryKey)} = ?`;
    } else {
      // continue
    }

    const update = db.prepare(queryString);

    const trans = db.transaction(() => {
      if (runTransactionsFirst) {
        transactions.forEach((t) => t());
        update.run(parameterValues);
      } else {
        update.run(parameterValues);
        transactions.forEach((t) => t());
      }
    });

    if (transaction) {
      return trans;
    } else {
      trans();
      return;
    }
  }

  Delete(
    tableName: string,
    primaryKey: string,
    primaryKeyValue: string,
    secondaryKey: string | undefined,
    secondaryKeyValue: string | undefined,
    transaction: boolean,
    transactions: any[],
    runTransactionsFirst: boolean,
  ): any | undefined {
    const db = this.getDb();
    if (!db) {
      return;
    } else {
      // continue
    }

    let queryString = `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`;

    const parameterValues: any[] = [primaryKeyValue];
    if (secondaryKey) {
      parameterValues.push(secondaryKeyValue);
      queryString += ` AND ${String(secondaryKey)} = ?`;
    } else {
      // continue
    }

    const del = db.prepare(queryString);

    const trans = db.transaction(() => {
      if (runTransactionsFirst) {
        transactions.forEach((t) => t());
        del.run(parameterValues);
      } else {
        del.run(parameterValues);
        transactions.forEach((t) => t());
      }
    });

    if (transaction) {
      return trans;
    } else {
      trans();
      return;
    }
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
    return;
  }
}
