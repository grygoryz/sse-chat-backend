import { Test, TestingModule } from '@nestjs/testing';
import { UserConnectedToChatGuard } from './user-connected-to-chat.guard';
import { ChatRepository } from '../chat.repository';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

describe('UserConnectedToChatGuard', () => {
	let guard: UserConnectedToChatGuard;
	let chatRedisRepository: DeepMocked<ChatRepository>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserConnectedToChatGuard,
				{
					provide: ChatRepository,
					useValue: createMock<ChatRepository>(),
				},
			],
		}).compile();

		guard = module.get(UserConnectedToChatGuard);
		chatRedisRepository = module.get(ChatRepository);
	});

	it('should throw error if user not connected', async () => {
		const executionContext = createMock<ExecutionContext>();
		executionContext.switchToHttp().getRequest.mockReturnValue({ session: { user: { id: 1 } } });
		chatRedisRepository.isUserConnected.mockResolvedValue(false);

		await expect(guard.canActivate(executionContext)).rejects.toThrow();
	});

	it('should pass if user connected', async () => {
		const executionContext = createMock<ExecutionContext>();
		executionContext.switchToHttp().getRequest.mockReturnValue({ session: { user: { id: 1 } } });
		chatRedisRepository.isUserConnected.mockResolvedValue(true);

		const response = await guard.canActivate(executionContext);

		await expect(response).toBe(true);
	});
});
