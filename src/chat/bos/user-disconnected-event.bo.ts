import { eventsTypes } from '../mappings';
import { UserDataBO } from './user-data.bo';
import { EventBO } from './event.bo';

export interface UserDisconnectedEventBO extends EventBO {
	type: typeof eventsTypes['userDisconnected'];
	data: Pick<UserDataBO, 'id'>;
}
