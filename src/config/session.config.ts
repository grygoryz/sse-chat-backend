import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from './config.interface';
import { Redis } from 'ioredis';
import * as session from 'express-session';
import * as ConnectRedis from 'connect-redis';
import { SessionOptions } from 'express-session';

const RedisStore = ConnectRedis(session);

export const sessionConfigFactory = (config: ConfigService<ConfigVariables>, redisClient: Redis): SessionOptions => {
	const store = new RedisStore({ client: redisClient });

	return {
		store,
		secret: config.get('sessionSecret')!,
		rolling: true,
		resave: false,
		saveUninitialized: false,
		name: 'sessionId',
		cookie: {
			httpOnly: true,
			maxAge: 5 * 60 * 60 * 1000, // 5 hours,
			secure: config.get('isProduction'),
		},
	};
};
