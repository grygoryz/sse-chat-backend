import { Body, Controller, Get, Put, Session, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTOBody, SignUpDTOBody } from './request-dtos';
import { CheckDTO, SignInDTO } from './response-dtos';
import { SessionBO, UserBO } from '@common/bos';
import { ApiTags } from '@nestjs/swagger';
import { promisify } from 'util';
import { AuthGuard } from '@common/guards';
import { User } from '@common/decorators';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Put('sign-up')
	async signUp(@Body() body: SignUpDTOBody): Promise<void> {
		await this.authService.signUp(body);
	}

	@Put('sign-in')
	async signIn(@Body() body: SignInDTOBody, @Session() session: SessionBO): Promise<SignInDTO> {
		const response = await this.authService.signIn(body);
		session.user = response;

		return {
			name: response.name,
		};
	}

	@Get('check')
	@UseGuards(AuthGuard)
	async check(@User() user: UserBO): Promise<CheckDTO> {
		return await this.authService.check(user.id);
	}

	@Put('sign-out')
	@UseGuards(AuthGuard)
	async signOut(@Session() session: SessionBO): Promise<void> {
		await promisify(session.destroy).call(session);
	}
}
