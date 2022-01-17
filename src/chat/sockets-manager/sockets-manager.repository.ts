import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { redisChatChannel, redisNamespaces } from '@helpers/mappings';
import { Redis } from 'ioredis';

@Injectable()
export class SocketsManagerRepository {
	constructor(
		@InjectRedis(redisNamespaces.main) private readonly client: Redis,
		@InjectRedis(redisNamespaces.sub) private readonly clientSub: Redis,
	) {}

	async subscribe<T>(onMessage: (message: T) => void): Promise<void> {
		await this.clientSub.subscribe(redisChatChannel);

		this.clientSub.on('message', (_, message) => {
			onMessage(JSON.parse(message));
		});
	}

	async publish(message: unknown): Promise<void> {
		await this.client.publish(redisChatChannel, JSON.stringify(message));
	}
}
