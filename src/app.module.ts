import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration, ConfigVariables, loggerConfigFactory, redisConfigFactory, sessionConfigFactory } from '@config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './ormconfig';
import { LoggerModule } from 'nestjs-pino';
import { ChatModule } from './chat/chat.module';
import { InjectRedis, RedisModule } from '@liaoliaots/nestjs-redis';
import { AuthModule } from './auth/auth.module';
import { redisNamespaces } from '@helpers/mappings';
import { Redis } from 'ioredis';
import { TestModule } from './test/test.module';
import * as session from 'express-session';

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [configuration],
		}),
		TypeOrmModule.forRoot(typeormConfig),
		LoggerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: loggerConfigFactory,
		}),
		RedisModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: redisConfigFactory,
		}),
		ChatModule,
		AuthModule,
		TestModule,
	],
})
export class AppModule implements NestModule {
	constructor(
		@InjectRedis(redisNamespaces.main) private readonly redisClient: Redis,
		private readonly configService: ConfigService<ConfigVariables>,
	) {}

	configure(consumer: MiddlewareConsumer) {
		const sessionConfig = sessionConfigFactory(this.configService, this.redisClient);
		consumer.apply(session(sessionConfig)).forRoutes('*');
	}
}
