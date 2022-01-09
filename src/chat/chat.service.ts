import { Injectable } from '@nestjs/common';
import { SocketsManagerService } from './sockets-manager/sockets-manager.service';
import { Socket } from './sockets-manager/socket.interface';
import { InitialDataEventBO, MessageBO, MessageEventBO, MessagesResponseBO, UserConnectedEventBO, UserDataBO } from './bos';
import { eventsTypes, messagesPageSize } from './mappings';
import { ChatRedisRepository } from './chat-redis.repository';
import * as crypto from 'crypto';

@Injectable()
export class ChatService {
	constructor(
		private readonly socketsManagerService: SocketsManagerService,
		private readonly chatRedisRepository: ChatRedisRepository,
	) {}

	async connectUser(userData: UserDataBO, socket: Socket): Promise<void> {
		const socketId = this.socketsManagerService.addSocket(socket);

		const isConnected = await this.chatRedisRepository.isUserConnected(userData.id);
		if (!isConnected) {
			await this.chatRedisRepository.addUser(userData);
			await this.socketsManagerService.broadcast<UserConnectedEventBO>({
				type: eventsTypes.userConnected,
				data: userData,
			});
		}

		const [users, messages] = await Promise.all([
			this.chatRedisRepository.getUsers(),
			this.chatRedisRepository.getMessages(0, messagesPageSize),
		]);

		this.socketsManagerService.sendTo<InitialDataEventBO>(socketId, {
			type: eventsTypes.initialData,
			data: { users, messages },
		});
	}

	async sendMessage(data: Pick<MessageBO, 'from' | 'text'>) {
		const id = crypto.randomUUID();
		const message = { id, timestamp: Date.now(), ...data };

		await this.chatRedisRepository.addMessage(message);
		await this.socketsManagerService.broadcast<MessageEventBO>({
			type: eventsTypes.message,
			data: message,
		});
	}

	async getMessages(start: number): Promise<MessagesResponseBO> {
		return await this.chatRedisRepository.getMessages(start, messagesPageSize);
	}
}
