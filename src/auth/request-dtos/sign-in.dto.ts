import { PickType } from '@nestjs/swagger';
import { SignUpDTOBody } from './sign-up.dto';

export class SignInDTOBody extends PickType(SignUpDTOBody, ['name', 'password']) {}
