import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import { User } from './entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SignInDTOBody, SignUpDTOBody } from './request-dtos';
import { SessionBO, UserBO } from '@common/bos';

describe('AuthController', () => {
	let controller: AuthController;
	let authService: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				AuthService,
				{
					provide: getRepositoryToken(User),
					useValue: createMock<Repository<User>>(),
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('signUp', () => {
		it('should return nothing on success', async () => {
			const body: SignUpDTOBody = { name: 'grigory', password: '123123' };
			authService.signUp = jest.fn().mockReturnValue(Promise.resolve());

			const result = await controller.signUp(body);

			expect(result).toBeUndefined();
		});
	});

	describe('signIn', () => {
		it('should return user name on success', async () => {
			const userData: Pick<User, 'name' | 'id'> = { id: 1, name: 'grigory' };
			const body: SignInDTOBody = { name: userData.name, password: '123123' };
			const session = createMock<SessionBO>();
			authService.signIn = jest.fn().mockResolvedValue(userData);

			const result = await controller.signIn(body, session);

			expect(result).toEqual({ name: userData.name });
		});

		it('should populate session on success', async () => {
			const userData: UserBO = { id: 1, name: 'grigory' };
			const body: SignInDTOBody = { name: userData.name, password: '123123' };
			const session = createMock<SessionBO>();
			authService.signIn = jest.fn().mockResolvedValue(userData);

			await controller.signIn(body, session);

			expect(session.user).toEqual(userData);
		});
	});

	describe('check', () => {
		it('should return user name on success', async () => {
			const userData: UserBO = { id: 1, name: 'grigory' };
			authService.check = jest.fn().mockResolvedValue({ name: userData.name });

			const result = await controller.check(userData);

			expect(result).toEqual({ name: userData.name });
		});
	});

	describe('signOut', () => {
		it('should destroy session on success', async () => {
			const session = createMock<SessionBO>();
			session.destroy.mockImplementation((callback: (err: any) => void) => {
				callback(null);
				return session;
			});

			await controller.signOut(session);
			expect(session.destroy).toBeCalled();
		});
	});
});
