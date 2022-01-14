import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import { SignUpBO } from './bos';
import * as bcrypt from 'bcrypt';
import { UserBO } from '@common/bos';

describe('AuthService', () => {
	let service: AuthService;
	let userRepository: DeepMocked<Repository<User>>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: getRepositoryToken(User),
					useValue: createMock<Repository<User>>(),
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		userRepository = module.get<DeepMocked<Repository<User>>>(getRepositoryToken(User));
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('signUp', () => {
		it('should insert user', async () => {
			const payload: SignUpBO = { name: 'grisha', password: '123123' };

			await service.signUp(payload);

			expect(userRepository.insert).toBeCalledTimes(1);
		});

		it('should hash password', async () => {
			const payload: SignUpBO = { name: 'grisha', password: '123123' };

			await service.signUp(payload);

			const hashedPassword = (userRepository.insert.mock.calls[0][0] as { name: string; password: string }).password;
			expect(bcrypt.compareSync(payload.password, hashedPassword)).toBe(true);
		});
	});

	describe('signIn', () => {
		it('should return user data on success', async () => {
			const user: UserBO = { id: 1, name: 'grisha' };
			const password = '123123';
			userRepository.findOne.mockResolvedValue({
				...user,
				password: bcrypt.hashSync(password, 11),
			});

			const response = await service.signIn({ name: user.name, password });

			expect(response).toEqual(user);
		});

		it('should throw error if user not found', async () => {
			userRepository.findOne.mockResolvedValue(undefined);

			await expect(service.signIn({ name: 'grisha', password: '123123' })).rejects.toThrow();
		});

		it('should throw error if password is wrong', async () => {
			const user: UserBO = { id: 1, name: 'grisha' };
			const password = 'asdl1m21asdm12';
			userRepository.findOne.mockResolvedValue({
				...user,
				password: bcrypt.hashSync('123123', 11),
			});

			await expect(service.signIn({ name: user.name, password })).rejects.toThrow();
		});
	});

	describe('check', () => {
		it('should return user name on success', async () => {
			const user: UserBO = { id: 1, name: 'grisha' };
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			userRepository.findOne.mockResolvedValue({ name: user.name });

			const response = await service.check(user.id);

			expect(response).toEqual({ name: user.name });
		});

		it('should throw error if user not found', async () => {
			const user: UserBO = { id: 1, name: 'grisha' };
			userRepository.findOne.mockResolvedValue(undefined);

			await expect(service.check(user.id)).rejects.toThrow();
		});
	});
});
