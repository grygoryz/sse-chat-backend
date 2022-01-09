import { UserDataBO } from './user-data.bo';

export interface MessageBO {
	id: string;
	from: UserDataBO['name'];
	text: string;
	timestamp: number;
}
