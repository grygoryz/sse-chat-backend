import { ApiProperty } from '@nestjs/swagger';

export class MessageDTO {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	from!: string;

	@ApiProperty()
	text!: string;

	@ApiProperty()
	timestamp!: number;
}
