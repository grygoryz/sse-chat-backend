import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMessagesDTOQuery {
	@ApiProperty()
	@IsInt()
	@Type(() => Number)
	start!: number;
}
