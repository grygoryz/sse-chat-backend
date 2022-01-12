import { Controller, Sse, MessageEvent, UseGuards, Post, Body, Get, Query, Req, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';
import { Socket } from './sockets-manager/socket.interface';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@common/guards';
import { GetMessagesDTOQuery, SendMessageDTOBody } from './request-dtos';
import { UserBO } from '@common/bos';
import { User } from '@common/decorators';
import { UserConnectedToChatGuard } from './guards';
import { Request } from 'express';

@Controller('chat')
@ApiTags('Chat')
export class ChatController {
	private readonly logger = new Logger(ChatController.name);

	constructor(private readonly chatService: ChatService) {}

	@Sse()
	@UseGuards(AuthGuard)
	connectToChat(@User() user: UserBO, @Req() req: Request): Observable<MessageEvent> {
		return new Observable(observer => {
			const socket: Socket = {
				emit: observer.next.bind(observer),
				disconnect: observer.complete.bind(observer),
			};

			this.chatService
				.connectUser(user, socket)
				.then(socketId => {
					req.on('close', this.getDisconnectHandler(user, socketId));
				})
				.catch(err => observer.error(err));
		});
	}

	@Post('messages')
	@UseGuards(AuthGuard, UserConnectedToChatGuard)
	async sendMessage(@Body() body: SendMessageDTOBody, @User() user: UserBO) {
		await this.chatService.sendMessage({ ...body, from: user.name });
	}

	@Get('messages')
	@UseGuards(AuthGuard, UserConnectedToChatGuard)
	async getMessages(@Query() query: GetMessagesDTOQuery) {
		return await this.chatService.getMessages(query.start);
	}

	private getDisconnectHandler(user: UserBO, socketId: string): () => Promise<void> {
		return async () => {
			try {
				await this.chatService.disconnectUser(user, socketId);
			} catch (err) {
				if (err instanceof Error) {
					this.logger.error(err.message, err.stack);
				}
			}
		};
	}
}
