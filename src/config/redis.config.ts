import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '@config';
import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { redisNamespaces } from '@helpers/mappings';

export const redisConfigFactory = (config: ConfigService<ConfigVariables>): RedisModuleOptions => {
	return {
		closeClient: true,
		readyLog: true,
		config: [
			{
				namespace: redisNamespaces.main,
				host: config.get('redisHost'),
				port: config.get('redisPort'),
			},
			{
				namespace: redisNamespaces.sub,
				host: config.get('redisHost'),
				port: config.get('redisPort'),
			},
		],
	};
};
