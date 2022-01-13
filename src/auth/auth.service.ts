import { Injectable } from '@nestjs/common';
import { SignInBO, SignUpBO } from './bos';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserId } from '@common/types';

@Injectable()
export class AuthService {
	constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

	async signUp({ name, password }: SignUpBO) {
		const passwordHash = await bcrypt.hash(password, 11);

		await this.userRepository.insert({ name, password: passwordHash });
	}

	async signIn({ name, password }: SignInBO): Promise<Pick<User, 'name' | 'id'>> {
		const user = await this.userRepository.findOne({ name }, { select: ['password', 'id', 'name'] });
		if (!user) {
			throw new Error('Credentials are not valid');
		}

		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			throw new Error('Credentials are not valid');
		}

		return {
			id: user.id,
			name: user.name,
		};
	}

	async check(id: UserId): Promise<Pick<User, 'name'>> {
		const user = await this.userRepository.findOne(id, { select: ['name'] });
		if (!user) {
			throw new Error('User not found');
		}

		return {
			name: user.name,
		};
	}
}
