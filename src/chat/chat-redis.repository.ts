import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { redisNamespaces, redisChatChannel } from '@helpers/mappings';

@Injectable()
export class ChatRedisRepository {
	constructor(
		@InjectRedis(redisNamespaces.main) private readonly client: Redis,
		@InjectRedis(redisNamespaces.sub) private readonly clientSub: Redis,
	) {}

	async subscribe<T>(onMessage: (message: T) => void) {
		await this.clientSub.subscribe(redisChatChannel);

		this.clientSub.on('message', (_, message) => {
			onMessage(JSON.parse(message));
		});
	}

	async publish(message: unknown) {
		await this.client.publish(redisChatChannel, JSON.stringify(message));
	}

	async getUsers() {
		return [];
	}

	async getMessages(start: number, count: number) {
		return [];
	}

	async isUserConnected(id: number) {
		return false;
	}

	async addUser(id: number, name: string) {}
}
