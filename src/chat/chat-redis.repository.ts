import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { redisNamespaces, redisChatChannel } from '@helpers/mappings';
import { MessageBO, MessagesResponseBO, UserDataBO } from './bos';
import { maxMessagesCount } from './mappings';

@Injectable()
export class ChatRedisRepository {
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

	async addUser(data: UserDataBO): Promise<void> {
		await this.client.multi().sadd('chat:users', data.id).set(`chat:users:${data.id}`, JSON.stringify(data)).exec();
	}

	async removeUser(id: number): Promise<void> {
		await this.client.multi().srem('chat:users', id).del(`chat:users:${id}`).exec();
	}

	async isUserConnected(id: number): Promise<boolean> {
		const result = await this.client.exists(`chat:users:${id}`);

		return !!result;
	}

	async addUserSocket(userId: number, socketId: string): Promise<void> {
		await this.client.sadd(`chat:users-sockets:${userId}`, socketId);
	}

	async removeUserSocket(userId: number, socketId: string): Promise<void> {
		await this.client.srem(`chat:users-sockets:${userId}`, socketId);
	}

	async hasUserSockets(id: number) {
		const count = await this.client.scard(`chat:users-sockets:${id}`);
		return count > 0;
	}

	async getUsers(): Promise<Array<UserDataBO>> {
		return await new Promise((resolve, reject) => {
			const ids = new Set<string>();
			const commands: Array<Array<string>> = [];

			const stream = this.client.sscanStream('chat:users');
			stream.on('data', (resultIds: Array<string>) => {
				resultIds.forEach(id => {
					if (!ids.has(id)) {
						ids.add(id);
						commands.push(['get', `chat:users:${id}`]);
					}
				});
			});
			stream.on('end', async () => {
				const results = await this.client.multi(commands).exec();
				const users = results.map(([err, user]) => (err ? null : JSON.parse(user))).filter(v => !!v);
				resolve(users);
			});
			stream.on('error', err => {
				reject(err);
			});
		});
	}

	async addMessage(data: MessageBO): Promise<void> {
		await this.client
			.multi()
			.lpush('chat:messages', JSON.stringify(data))
			.ltrim('chat:messages', 0, maxMessagesCount - 1)
			.exec();
	}

	async getMessages(start: number, count: number): Promise<MessagesResponseBO> {
		const [[, messages], [, length]] = await this.client
			.multi()
			.lrange('chat:messages', start, start + count - 1)
			.llen('chat:messages')
			.exec();

		return {
			messages: (messages as Array<string>).map(message => JSON.parse(message)),
			total: length,
		};
	}
}
