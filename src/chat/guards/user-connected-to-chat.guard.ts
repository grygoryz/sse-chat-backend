import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ChatRedisRepository } from '../chat-redis.repository';

@Injectable()
export class UserConnectedToChatGuard implements CanActivate {
	constructor(private readonly chatRedisRepository: ChatRedisRepository) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<Request>();
		const isConnected = await this.chatRedisRepository.isUserConnected(request.session.user.id);
		if (!isConnected) {
			throw new Error('User not connected to chat');
		}
		return true;
	}
}
