import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration, loggerConfigFactory, redisConfigFactory } from '@config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './ormconfig';
import { LoggerModule } from 'nestjs-pino';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

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
	],
})
export class AppModule {}
