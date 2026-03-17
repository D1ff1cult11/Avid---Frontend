import sqlite3 from "sqlite3";

sqlite3.verbose();

export interface RunResult {
  lastID: number;
  changes: number;
}

export class SQLiteClient {
  private readonly db: sqlite3.Database;

  constructor(filePath: string) {
    this.db = new sqlite3.Database(filePath);
  }

  async initialize(): Promise<void> {
    await this.exec("PRAGMA foreign_keys = ON;");
    await this.exec("PRAGMA journal_mode = WAL;");
    await this.exec("PRAGMA busy_timeout = 5000;");
  }

  run(sql: string, params: unknown[] = []): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function onRun(error) {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          lastID: this.lastID ?? 0,
          changes: this.changes ?? 0
        });
      });
    });
  }

  get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (error, row) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(row as T | undefined);
      });
    });
  }

  all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (error, rows) => {
        if (error) {
          reject(error);
          return;
        }

        resolve((rows ?? []) as T[]);
      });
    });
  }

  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  async transaction<T>(work: () => Promise<T>): Promise<T> {
    await this.run("BEGIN");
    try {
      const result = await work();
      await this.run("COMMIT");
      return result;
    } catch (error) {
      await this.run("ROLLBACK");
      throw error;
    }
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}
