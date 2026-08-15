import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

type Methods = 'put' | 'patch' | 'del';
type CacheKeys = 'clubs' | 'c' | 'g' | 'pg' | 'pgp' | 'bg' | 'p' | 't' | 'tbg' | 'tg' | 'tp' | 'tpg' | 'e';

type KV = `${Methods}-${CacheKeys}`;

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async fetch<T>(key: CacheKeys, clubId: string, data: () => T, ttl = 1000 * 60 * 60) {
    const id = `${key}:${clubId}`;
    const cached = (await this.cacheManager.get(id)) as T | undefined;
    if (cached) {
      return cached;
    } else {
      console.log('Cache Miss:', id);
      const toReturn = data();
      await this.cacheManager.set(id, toReturn, ttl);
      return toReturn;
    }
  }

  bust(method: Methods, key: CacheKeys, clubId = '') {
    const kv: KV = `${method}-${key}`;
    switch (kv) {
      case 'put-c':
      case 'del-c':
      case 'put-g':
      case 'del-g':
      case 'put-p':
      case 'del-p':
      case 'put-bg':
      case 'del-bg':
        this.delete('clubs', '');
        break;
      default:
      // Do nothing
    }
  }

  private delete(key: CacheKeys, clubId: string) {
    this.deleteMany([key], clubId);
  }

  private deleteMany(key: CacheKeys[], clubId: string) {
    key.forEach((k) => {
      console.log('Cache Bust:', `${k}:${clubId}`);
      this.cacheManager.del(`${k}:${clubId}`);
    });
  }
}
