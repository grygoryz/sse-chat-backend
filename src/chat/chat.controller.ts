import { Controller, Sse, MessageEvent, UseGuards, Post, Body, Get, Query, Req } from '@nestjs/common';
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
	constructor(private readonly chatService: ChatService) {}

	@Sse()
	@UseGuards(AuthGuard)
	connectToChat(@User() user: UserBO): Observable<MessageEvent> {
		const observable: Observable<MessageEvent> = new Observable(observer => {
			const socket: Socket = {
				emit: observer.next.bind(observer),
				disconnect: observer.complete.bind(observer),
			};

			this.chatService.connectUser(user, socket).catch(err => observer.error(err));
		});

		return observable;
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
}
