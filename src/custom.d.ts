import { SessionBO } from '@common/bos';

declare module 'express-session' {
	interface Session {
		user: SessionBO['user'];
	}
}
