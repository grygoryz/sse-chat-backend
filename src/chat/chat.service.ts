import { Injectable } from '@nestjs/common';
import { SocketsManagerService } from './sockets-manager/sockets-manager.service';
import { Socket } from './sockets-manager/socket.interface';
import { InitialDataEvent, UserConnectedEvent, UserDataBO } from './bos';
import { eventsTypes, messagesPageSize } from './mappings';
import { ChatRedisRepository } from './chat-redis.repository';

@Injectable()
export class ChatService {
	constructor(
		private readonly socketsManagerService: SocketsManagerService,
		private readonly chatRedisRepository: ChatRedisRepository,
	) {}

	async connectUser(userData: UserDataBO, sessionId: string, socket: Socket) {
		this.socketsManagerService.addSocket(sessionId, socket);

		const isConnected = await this.chatRedisRepository.isUserConnected(userData.id);
		if (!isConnected) {
			await this.chatRedisRepository.addUser(userData.id, userData.name);
			await this.socketsManagerService.broadcast<UserConnectedEvent>({
				type: eventsTypes.userConnected,
				data: userData,
			});
		}

		const [users, messages] = await Promise.all([
			this.chatRedisRepository.getUsers(),
			this.chatRedisRepository.getMessages(0, messagesPageSize),
		]);

		this.socketsManagerService.sendTo<InitialDataEvent>(sessionId, {
			type: eventsTypes.initialData,
			data: { users, messages },
		});
	}
}
