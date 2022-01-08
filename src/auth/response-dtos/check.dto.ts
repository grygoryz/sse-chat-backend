import { PickType } from '@nestjs/swagger';
import { SignInDTO } from './sign-in.dto';

export class CheckDTO extends PickType(SignInDTO, ['name']) {}
