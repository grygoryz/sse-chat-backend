import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from './config.interface';
import { Params } from 'nestjs-pino';

export const loggerConfigFactory = (config: ConfigService<ConfigVariables>): Params => {
	return {
		pinoHttp: {
			prettyPrint: !config.get('isProduction') && {
				translateTime: 'SYS:standard',
				ignore: 'hostname,pid',
			},
			redact: ['*.headers.cookie', 'req.body.password', 'res.headers["set-cookie"]'],
			serializers: {
				req(req) {
					req.body = req.raw.body;
					return req;
				},
				...(config.get('isResponseBodyLoggingEnabled') && {
					res(res) {
						const body = res.raw.locals.body;
						try {
							res.body = typeof body === 'number' ? body : JSON.parse(body);
						} catch (e) {
							res.body = body;
						}
						return res;
					},
				}),
			},
		},
	};
};
