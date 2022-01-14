import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SocketsManagerService } from './sockets-manager/sockets-manager.service';
import { ChatRedisRepository } from './chat-redis.repository';
import { SocketsManagerRedisRepository } from './sockets-manager/sockets-manager-redis.repository';

@Module({
	controllers: [ChatController],
	providers: [ChatService, SocketsManagerService, ChatRedisRepository, SocketsManagerRedisRepository],
})
export class ChatModule {}
