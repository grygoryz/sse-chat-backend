import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { SocketsManagerService } from './sockets-manager/sockets-manager.service';
import { ChatRedisRepository } from './chat-redis.repository';
import { SocketsManagerRedisRepository } from './sockets-manager/sockets-manager-redis.repository';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
	InitialDataEventBO,
	MessageBO,
	MessageEventBO,
	MessagesResponseBO,
	UserConnectedEventBO,
	UserDataBO,
	UserDisconnectedEventBO,
} from './bos';
import { Socket } from './sockets-manager/socket.interface';
import * as crypto from 'crypto';
import { eventsTypes } from './mappings';

describe('ChatController', () => {
	let service: ChatService;
	let socketsManagerService: DeepMocked<SocketsManagerService>;
	let chatRedisRepository: DeepMocked<ChatRedisRepository>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ChatService,
				{
					provide: SocketsManagerService,
					useValue: createMock<SocketsManagerService>(),
				},
				{
					provide: ChatRedisRepository,
					useValue: createMock<ChatRedisRepository>(),
				},
				{
					provide: SocketsManagerRedisRepository,
					useValue: createMock<SocketsManagerRedisRepository>(),
				},
			],
		}).compile();

		service = module.get<ChatService>(ChatService);
		socketsManagerService = module.get(SocketsManagerService);
		chatRedisRepository = module.get(ChatRedisRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('connectUser', () => {
		it('should return socketId on success', async () => {
			const userData: UserDataBO = { id: 1, name: 'grisha' };
			const socket = createMock<Socket>();
			const socketId = crypto.randomUUID();
			socketsManagerService.addSocket.mockReturnValue(socketId);

			const response = await service.connectUser(userData, socket);

			expect(response).toBe(socketId);
		});

		it('should emit initial data', async () => {
			const userData: UserDataBO = { id: 1, name: 'grisha' };
			const socket = createMock<Socket>();
			const socketId = crypto.randomUUID();
			socketsManagerService.addSocket.mockReturnValue(socketId);
			const users: Array<UserDataBO> = [{ id: 1, name: 'grisha' }];
			const messages: MessagesResponseBO = {
				messages: [{ from: 'grisha', id: crypto.randomUUID(), text: 'hi', timestamp: Date.now() }],
				total: 1,
			};
			chatRedisRepository.getUsers.mockResolvedValue(users);
			chatRedisRepository.getMessages.mockResolvedValue(messages);

			await service.connectUser(userData, socket);

			expect(socketsManagerService.sendTo).toBeCalledTimes(1);
			expect(socketsManagerService.sendTo).toBeCalledWith(socketId, <InitialDataEventBO>{
				type: eventsTypes.initialData,
				data: { users, messages },
			});
		});

		it('should add user to db and broadcast to chat if it is his first connection', async () => {
			const userData: UserDataBO = { id: 1, name: 'grisha' };
			const socket = createMock<Socket>();
			chatRedisRepository.isUserConnected.mockResolvedValue(false);

			await service.connectUser(userData, socket);

			expect(chatRedisRepository.addUser).toBeCalledWith(userData);
			expect(socketsManagerService.broadcast).toBeCalledWith(<UserConnectedEventBO>{
				type: eventsTypes.userConnected,
				data: userData,
			});
		});

		it('should not add user to db and broadcast to chat if it is not his first connection', async () => {
			const userData: UserDataBO = { id: 1, name: 'grisha' };
			const socket = createMock<Socket>();
			chatRedisRepository.isUserConnected.mockResolvedValue(true);

			await service.connectUser(userData, socket);

			expect(chatRedisRepository.addUser).not.toHaveBeenCalled();
			expect(socketsManagerService.broadcast).not.toHaveBeenCalled();
		});
	});

	describe('disconnectUser', () => {
		it('should remove socket from SocketsManagerService and from db', async () => {
			const userData: UserDataBO = { id: 1, name: 'grisha' };
			const socketId = crypto.randomUUID();

			await service.disconnectUser(userData, socketId);

			expect(socketsManagerService.removeSocket).toBeCalledWith(socketId);
			expect(chatRedisRepository.removeUserSocket).toBeCalledWith(userData.id, socketId);
		});

		it('should remove user from db and broadcast if no sockets left', async () => {
			const userData: UserDataBO = { id: 1, name: 'grisha' };
			chatRedisRepository.hasUserSockets.mockResolvedValue(false);

			await service.disconnectUser(userData, crypto.randomUUID());

			expect(chatRedisRepository.removeUser).toBeCalledWith(userData.id);
			expect(socketsManagerService.broadcast).toBeCalledWith(<UserDisconnectedEventBO>{
				type: eventsTypes.userDisconnected,
				data: { id: userData.id },
			});
		});

		it('should not remove user from db and broadcast if sockets exist', async () => {
			const userData: UserDataBO = { id: 1, name: 'grisha' };
			chatRedisRepository.hasUserSockets.mockResolvedValue(true);

			await service.disconnectUser(userData, crypto.randomUUID());

			expect(chatRedisRepository.removeUser).not.toHaveBeenCalled();
			expect(socketsManagerService.broadcast).not.toHaveBeenCalled();
		});
	});

	describe('sendMessage', () => {
		it('should add message to db and broadcast it', async () => {
			const data: Pick<MessageBO, 'from' | 'text'> = { from: 'grisha', text: 'hi' };

			await service.sendMessage(data);

			expect(chatRedisRepository.addMessage).toBeCalledTimes(1);
			const message = chatRedisRepository.addMessage.mock.calls[0][0];
			expect(socketsManagerService.broadcast).toBeCalledWith(<MessageEventBO>{
				type: eventsTypes.message,
				data: message,
			});
		});
	});

	describe('getMessages', () => {
		it('should return messages', async () => {
			const messages: MessagesResponseBO = {
				messages: [{ from: 'grisha', id: crypto.randomUUID(), text: 'hi', timestamp: Date.now() }],
				total: 1,
			};
			chatRedisRepository.getMessages.mockResolvedValue(messages);

			const response = await service.getMessages(0);

			expect(response).toEqual(messages);
		});
	});
});
