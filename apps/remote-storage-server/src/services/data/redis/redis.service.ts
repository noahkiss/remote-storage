import { Injectable, OnModuleInit } from '@nestjs/common'
import { createClient } from 'redis'
import { DataService } from '../data-service/data-service.interface'

@Injectable()
export class RedisService implements OnModuleInit, DataService {
  private client: any
  private initialized = false

  constructor() {}

  async onModuleInit() {
    if (this.initialized || process.env.DATA_STORE === 'sqlite') {
      return
    }

    try {
      this.client = await createClient({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
      })
        .on('error', (err) => console.log('Redis Client Error', err))
        .connect()

      this.initialized = true
    } catch (e) {
      console.log('Failed to connect to db', e)
    }
  }

  async get(key: string) {
    const value = await this.client.get(key)
    return value ? JSON.parse(value) : null
  }

  async set(key: string, value: any) {
    return this.client.set(key, JSON.stringify(value))
  }

  async delete(key: string) {
    return this.client.del(key)
  }
}
