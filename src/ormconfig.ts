import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, NODE_ENV } = process.env;

type TypeormConfig = TypeOrmModuleOptions & { seeds: Array<string> };

export const typeormConfig: TypeormConfig = {
	type: 'postgres' as const,
	host: POSTGRES_HOST,
	port: +(POSTGRES_PORT as string),
	username: POSTGRES_USER,
	password: POSTGRES_PASSWORD,
	database: POSTGRES_DB,
	maxQueryExecutionTime: 1000,
	synchronize: false,
	logging: NODE_ENV !== 'production',
	entities: [`${__dirname}/databases/postgres/entities/*.entity.{ts,js}`],
	migrations: [`${__dirname}/databases/postgres/migrations/*.{ts,js}`],
	seeds: [`${__dirname}/databases/postgres/seeds/*.{ts,js}`],
	cli: {
		migrationsDir: `${__dirname}/databases/postgres/migrations`,
	},
};

export default typeormConfig;
