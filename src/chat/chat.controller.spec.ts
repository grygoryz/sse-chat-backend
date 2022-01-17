import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SocketsManagerService } from './sockets-manager/sockets-manager.service';
import { ChatRepository } from './chat.repository';
import { SocketsManagerRepository } from './sockets-manager/sockets-manager.repository';
import { createMock } from '@golevelup/ts-jest';
import { UserBO } from '@common/bos';
import { SendMessageDTOBody } from './request-dtos';
import { MessagesResponseBO, UserConnectedEventBO } from './bos';
import * as crypto from 'crypto';
import { Request } from 'express';
import { Socket } from './sockets-manager/socket.interface';
import { eventsTypes } from './mappings';

describe('ChatController', () => {
	let controller: ChatController;
	let chatService: ChatService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ChatController],
			providers: [
				ChatService,
				SocketsManagerService,
				{
					provide: ChatRepository,
					useValue: createMock<ChatRepository>(),
				},
				{
					provide: SocketsManagerRepository,
					useValue: createMock<SocketsManagerRepository>(),
				},
			],
		}).compile();

		controller = module.get<ChatController>(ChatController);
		chatService = module.get<ChatService>(ChatService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('connectToChat', () => {
		it('should return message events on success', done => {
			const user: UserBO = { id: 1, name: 'grisha' };
			const req = createMock<Request>();
			const message: UserConnectedEventBO = { type: eventsTypes.userConnected, data: { id: 1, name: 'grisha' } };
			chatService.connectUser = jest.fn().mockImplementation(async (user: UserBO, socket: Socket) => {
				socket.emit(message);
				return crypto.randomUUID();
			});

			controller.connectToChat(user, req).subscribe(value => {
				expect(value).toEqual(message);
				done();
			});
		});

		it('should bind disconnect handler to req on success', done => {
			const user: UserBO = { id: 1, name: 'grisha' };
			const req = createMock<Request>();
			const message: UserConnectedEventBO = { type: eventsTypes.userConnected, data: { id: 1, name: 'grisha' } };
			chatService.connectUser = jest.fn().mockImplementation(async (user: UserBO, socket: Socket) => {
				socket.emit(message);
				return crypto.randomUUID();
			});

			controller.connectToChat(user, req).subscribe(async () => {
				// flush promises
				await new Promise(process.nextTick);

				expect(req.on.mock.calls[0][0]).toBe('close');
				expect(typeof req.on.mock.calls[0][1] === 'function').toBe(true);
				done();
			});
		});

		it('should handle error', done => {
			const user: UserBO = { id: 1, name: 'grisha' };
			const req = createMock<Request>();
			chatService.connectUser = jest.fn().mockRejectedValue(new Error());

			controller.connectToChat(user, req).subscribe({
				error: () => done(),
			});
		});
	});

	describe('sendMessage', () => {
		it('should return nothing on success', async () => {
			const user: UserBO = { id: 1, name: 'grisha' };
			const message: SendMessageDTOBody = { text: 'hello world!' };
			chatService.sendMessage = jest.fn().mockReturnValue(Promise.resolve());

			const response = await controller.sendMessage(message, user);

			expect(response).toBeUndefined();
		});
	});

	describe('getMessages', () => {
		it('should return messages', async () => {
			const messages: MessagesResponseBO = {
				messages: [{ from: 'grisha', id: crypto.randomUUID(), text: 'hi', timestamp: Date.now() }],
				total: 1,
			};
			chatService.getMessages = jest.fn().mockResolvedValue(messages);

			const response = await controller.getMessages({ start: 0 });

			expect(response).toEqual(messages);
		});
	});
});
