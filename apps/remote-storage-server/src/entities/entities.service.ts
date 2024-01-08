import { Injectable, NotFoundException } from '@nestjs/common'
import { Actor, Entity } from './entities.interface'
import { RedisService } from '../services/redis/redis.service'

@Injectable()
export class EntitiesService {
  constructor(private redisService: RedisService) {}

  async get(actor: Actor, key: string): Promise<Entity> {
    const entityKey = this.getEntityKey(actor, key)
    const value = await this.redisService.get(entityKey)

    if (!value) {
      throw new NotFoundException('Entity not found')
    }

    return value
  }

  async set(actor: Actor, key: string, value: any): Promise<void> {
    const entityKey = this.getEntityKey(actor, key)

    return await this.redisService.set(entityKey, value)
  }

  async delete(actor: Actor, key: string): Promise<void> {
    const entityKey = this.getEntityKey(actor, key)

    return await this.redisService.delete(entityKey)
  }

  private getEntityKey(actor: Actor, key: string): string {
    return `${actor.instanceId}:${actor.userId}:${key}`
  }
}