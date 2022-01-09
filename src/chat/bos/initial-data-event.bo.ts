import { eventsTypes } from '../mappings';
import { EventBO } from './event.bo';
import { UserDataBO } from './user-data.bo';
import { MessagesResponseBO } from './messages-response.bo';

export interface InitialDataEventBO extends EventBO {
	type: typeof eventsTypes['initialData'];
	data: {
		messages: MessagesResponseBO;
		users: Array<UserDataBO>;
	};
}
