import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		const responseBody =
			exception instanceof HttpException
				? exception.getResponse()
				: {
						statusCode: status,
						message: exception?.message ?? 'Internal server error',
				  };

		// for the http-pino to log actual error
		response.err = exception;

		response.status(status).json(responseBody);
	}
}
