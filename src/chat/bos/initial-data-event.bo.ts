import { eventsTypes } from '../mappings';
import { EventBO } from './event.bo';
import { UserDataBO } from './user-data.bo';

export interface InitialDataEvent extends EventBO {
	type: typeof eventsTypes['initialData'];
	data: {
		messages: Array<any>;
		users: Array<UserDataBO>;
	};
}
