import { Controller, Sse, MessageEvent, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';
import { Socket } from './sockets-manager/socket.interface';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@common/guards';

@Controller('chat')
@ApiTags('Chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Sse()
	@UseGuards(AuthGuard)
	connectToChat(): Observable<MessageEvent> {
		return new Observable(observer => {
			const socket: Socket = {
				emit: observer.next.bind(observer),
				disconnect: observer.complete.bind(observer),
			};

			this.chatService.connectUser({ id: 1, name: 'Grisha' }, 'asdqwe', socket).catch(err => observer.error(err));
		});
	}
}
