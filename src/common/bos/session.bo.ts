import { Session } from 'express-session';
import { UserBO } from '@common/bos/user.bo';

export interface SessionBO extends Session {
	user: UserBO;
}
