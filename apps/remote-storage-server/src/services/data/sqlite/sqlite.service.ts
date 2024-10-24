import { Injectable, OnModuleInit } from '@nestjs/common'
import { DataService } from '../data-service/data-service.interface'
import { Database } from 'sqlite3'
import * as fs from 'fs/promises'
import * as path from 'path'

@Injectable()
export class SqliteService implements OnModuleInit, DataService {
  private db = null
  private initialized = false

  constructor() {}

  async onModuleInit() {
    if (this.initialized || process.env.DATA_STORE !== 'sqlite') {
      return
    }

    try {
      const dbPath = './data/database.sqlite'
      const dirPath = path.dirname(dbPath)

      // Ensure the directory exists
      await fs.mkdir(dirPath, { recursive: true })

      this.db = new Database(dbPath)
      await this.db.run(
        `CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT);
         CREATE INDEX IF NOT EXISTS key_index ON kv (key)`
      )

      this.initialized = true
    } catch (e) {
      console.error('Failed to initialize sqlite database', e)
    }
  }

  async get<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT value FROM kv WHERE key = ?', [key], (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row ? JSON.parse(row.value) : null)
        }
      })
    })
  }

  async set(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
        [key, JSON.stringify(value), JSON.stringify(value)],
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  }

  async delete(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM kv WHERE key = ?', [key], (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}
