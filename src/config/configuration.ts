export const configuration = () => ({
	port: parseInt(process.env.PORT as string, 10) || 3000,
	isProduction: process.env.NODE_ENV === 'production',
	isResponseBodyLoggingEnabled: process.env.LOG_RESPONSE_BODY === 'true',

	redisPort: process.env.REDIS_PORT,
	redisHost: process.env.REDIS_HOST,
});
