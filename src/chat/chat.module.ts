import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SocketsManagerService } from './sockets-manager/sockets-manager.service';
import { ChatRepository } from './chat.repository';
import { SocketsManagerRepository } from './sockets-manager/sockets-manager.repository';

@Module({
	controllers: [ChatController],
	providers: [ChatService, SocketsManagerService, ChatRepository, SocketsManagerRepository],
})
export class ChatModule {}
