import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';

export class SignUpDTOBody {
	@ApiProperty()
	@MaxLength(50)
	@MinLength(2)
	name!: string;

	@ApiProperty()
	@MaxLength(70)
	@MinLength(6)
	password!: string;
}
