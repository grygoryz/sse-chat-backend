import { Session } from 'express-session';

export interface SessionBO extends Session {
	user: {
		id: number;
		name: string;
	};
}
