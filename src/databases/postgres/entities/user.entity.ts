import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column('varchar', { length: 50 })
	name!: string;

	@Column('text', { select: false })
	password!: string;
}
