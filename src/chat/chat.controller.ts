import { Controller, Sse, MessageEvent, UseGuards, Post, Body, Get, Query, Req, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';
import { Socket } from './sockets-manager/socket.interface';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath, refs } from '@nestjs/swagger';
import { AuthGuard } from '@common/guards';
import { GetMessagesDTOQuery, SendMessageDTOBody } from './request-dtos';
import { UserBO } from '@common/bos';
import { User } from '@common/decorators';
import { UserConnectedToChatGuard } from './guards';
import { Request } from 'express';
import { SocketId } from '@common/types';
import {
	GetMessagesDTO,
	InitialDataEventDTO,
	MessageEventDTO,
	UserConnectedEventDTO,
	UserDisconnectedEventDTO,
} from './response-dtos';

@Controller('chat')
@ApiTags('Chat')
@ApiExtraModels(MessageEventDTO, InitialDataEventDTO, UserConnectedEventDTO, UserDisconnectedEventDTO)
export class ChatController {
	private readonly logger = new Logger(ChatController.name);

	constructor(private readonly chatService: ChatService) {}

	@Sse()
	@UseGuards(AuthGuard)
	@ApiOperation({ summary: 'connect to chat by SSE' })
	@ApiOkResponse({
		schema: {
			oneOf: refs(MessageEventDTO, InitialDataEventDTO, UserDisconnectedEventDTO, UserConnectedEventDTO),
		},
	})
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
	@ApiOperation({ summary: 'send message to chat' })
	@UseGuards(AuthGuard, UserConnectedToChatGuard)
	async sendMessage(@Body() body: SendMessageDTOBody, @User() user: UserBO): Promise<void> {
		await this.chatService.sendMessage({ ...body, from: user.name });
	}

	@Get('messages')
	@ApiOperation({ summary: 'get chat messages' })
	@UseGuards(AuthGuard, UserConnectedToChatGuard)
	@ApiOkResponse({ type: GetMessagesDTO })
	async getMessages(@Query() query: GetMessagesDTOQuery): Promise<GetMessagesDTO> {
		return await this.chatService.getMessages(query.start);
	}

	private getDisconnectHandler(user: UserBO, socketId: SocketId): () => Promise<void> {
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
