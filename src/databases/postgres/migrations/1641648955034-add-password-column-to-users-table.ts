import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPasswordColumnToUsersTable1641648955034 implements MigrationInterface {
	name = 'addPasswordColumnToUsersTable1641648955034';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "public"."users" ADD "password" text NOT NULL`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "password"`);
	}
}
