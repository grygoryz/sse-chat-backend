import { Injectable, OnModuleInit } from '@nestjs/common';
import { Socket } from './socket.interface';
import { Message } from './message.interface';
import { ChatRedisRepository } from '../chat-redis.repository';
import * as crypto from 'crypto';

@Injectable()
export class SocketsManagerService implements OnModuleInit {
	private sockets: Map<string, Socket> = new Map();

	constructor(private readonly chatRedisRepository: ChatRedisRepository) {}

	async onModuleInit() {
		await this.chatRedisRepository.subscribe<Message>(message => {
			this.sockets.forEach(socket => {
				socket.emit(message.data);
			});
		});
	}

	addSocket(socket: Socket): string {
		const socketId = crypto.randomUUID();
		this.sockets.set(socketId, socket);
		return socketId;
	}

	removeSocket(id: string) {
		this.sockets.delete(id);
	}

	sendTo<T>(id: string, data: T) {
		const socket = this.sockets.get(id);
		if (!socket) {
			throw new Error(`Socket ${id} not found`);
		}

		socket.emit(data);
	}

	async broadcast<T>(data: T) {
		await this.chatRedisRepository.publish(<Message>{ type: 'broadcast', data });
	}
}
