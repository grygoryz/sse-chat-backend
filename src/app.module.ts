import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration, loggerConfigFactory } from '@config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './ormconfig';
import { LoggerModule } from 'nestjs-pino';

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
	],
})
export class AppModule {}
