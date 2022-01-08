import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';
import { Socket } from './sockets-manager/socket.interface';

@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Sse()
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
