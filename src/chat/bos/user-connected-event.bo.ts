import { eventsTypes } from '../mappings';
import { UserDataBO } from './user-data.bo';
import { EventBO } from './event.bo';

export interface UserConnectedEventBO extends EventBO {
	type: typeof eventsTypes['userConnected'];
	data: UserDataBO;
}
