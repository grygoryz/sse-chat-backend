import { eventsTypes } from '../mappings';
import { EventBO } from './event.bo';
import { MessageBO } from './message.bo';

export interface MessageEventBO extends EventBO {
	type: typeof eventsTypes['message'];
	data: MessageBO;
}
