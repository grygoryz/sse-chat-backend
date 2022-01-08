import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ConfigVariables } from '@config';
import { HttpExceptionsFilter } from '@common/filters';
import { Logger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
	const configService: ConfigService<ConfigVariables> = app.get(ConfigService);
	const port = configService.get('port', { infer: true })!;

	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	app.useGlobalFilters(new HttpExceptionsFilter());
	app.useLogger(app.get(Logger));
	app.enableShutdownHooks();
	app.disable('x-powered-by');

	const config = new DocumentBuilder().setTitle('SSE chat').setVersion('1.0').build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(port);
	app.get(Logger).log(`Server started on port ${port}`);
}

bootstrap();
