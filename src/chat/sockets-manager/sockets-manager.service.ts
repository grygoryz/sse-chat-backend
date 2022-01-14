import { Injectable, OnModuleInit } from '@nestjs/common';
import { Socket } from './socket.interface';
import { Message } from './message.interface';
import * as crypto from 'crypto';
import { SocketsManagerRedisRepository } from './sockets-manager-redis.repository';
import { SocketId } from '@common/types';

@Injectable()
export class SocketsManagerService implements OnModuleInit {
	private sockets: Map<SocketId, Socket> = new Map();

	constructor(private readonly socketsManagerRedisRepository: SocketsManagerRedisRepository) {}

	async onModuleInit() {
		await this.socketsManagerRedisRepository.subscribe<Message>(message => {
			this.sockets.forEach(socket => {
				socket.emit(message.data);
			});
		});
	}

	addSocket(socket: Socket): SocketId {
		const socketId = crypto.randomUUID();
		this.sockets.set(socketId, socket);
		return socketId;
	}

	removeSocket(id: SocketId) {
		this.sockets.delete(id);
	}

	sendTo<T>(id: SocketId, data: T) {
		const socket = this.sockets.get(id);
		if (!socket) {
			throw new Error(`Socket ${id} not found`);
		}

		socket.emit(data);
	}

	async broadcast<T>(data: T) {
		await this.socketsManagerRedisRepository.publish(<Message>{ type: 'broadcast', data });
	}
}
