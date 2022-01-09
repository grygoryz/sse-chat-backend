import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';

export class SendMessageDTOBody {
	@ApiProperty()
	@MaxLength(500)
	@MinLength(1)
	text!: string;
}
