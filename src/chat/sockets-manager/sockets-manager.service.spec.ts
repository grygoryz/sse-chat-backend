import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Message } from './message.interface';
import { SocketsManagerService } from './sockets-manager.service';
import { SocketsManagerRedisRepository } from './sockets-manager-redis.repository';
import { Socket } from './socket.interface';
import * as crypto from 'crypto';

describe('ChatController', () => {
	let service: SocketsManagerService;
	let socketsManagerRedisRepository: SocketsManagerRedisRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SocketsManagerService,
				{
					provide: SocketsManagerRedisRepository,
					useValue: createMock<SocketsManagerRedisRepository>(),
				},
			],
		}).compile();

		service = module.get<SocketsManagerService>(SocketsManagerService);
		socketsManagerRedisRepository = module.get<SocketsManagerRedisRepository>(SocketsManagerRedisRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('onModuleInit', () => {
		it('should subscribe to redis channel and broadcast message', async () => {
			const message: Message = { type: 'broadcast', data: 'data' };
			socketsManagerRedisRepository.subscribe = jest.fn().mockImplementation(async cb => {
				cb(message);
			});
			const firstSocket = createMock<Socket>();
			const secondSocket = createMock<Socket>();
			service.addSocket(firstSocket);
			service.addSocket(secondSocket);

			await service.onModuleInit();

			expect(socketsManagerRedisRepository.subscribe).toBeCalledTimes(1);
			expect(firstSocket.emit).toBeCalledWith(message.data);
			expect(secondSocket.emit).toBeCalledWith(message.data);
		});
	});

	describe('addSocket', () => {
		it('should add socket and return socketId', () => {
			const socket = createMock<Socket>();

			const socketId = service.addSocket(socket);

			expect(typeof socketId === 'string').toBe(true);
			expect(service['sockets'].get(socketId)).toBe(socket);
		});
	});

	describe('removeSocket', () => {
		it('should remove socket', () => {
			const socket = createMock<Socket>();
			const socketId = service.addSocket(socket);

			service.removeSocket(socketId);

			expect(service['sockets'].has(socketId)).toBe(false);
		});
	});

	describe('sendTo', () => {
		it('should emit data to socket', () => {
			const socket = createMock<Socket>();
			const socketId = service.addSocket(socket);
			const data = 'hi';

			service.sendTo(socketId, data);

			expect(socket.emit).toBeCalledTimes(1);
			expect(socket.emit).toBeCalledWith(data);
		});

		it('should throw error if socket not found', () => {
			expect(service.sendTo.bind(crypto.randomUUID(), 'hi')).toThrow();
		});
	});

	describe('broadcast', () => {
		it('should publish data to redis channel', async () => {
			const data = 'hi';
			socketsManagerRedisRepository.publish = jest.fn();

			await service.broadcast(data);

			expect(socketsManagerRedisRepository.publish).toBeCalledTimes(1);
			expect(socketsManagerRedisRepository.publish).toBeCalledWith(<Message>{
				type: 'broadcast',
				data,
			});
		});
	});
});
