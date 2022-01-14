import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class Message {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	from!: string;

	@ApiProperty()
	text!: string;

	@ApiProperty()
	timestamp!: number;
}

export class GetMessagesDTO {
	@ApiProperty()
	total!: number;

	@ApiProperty({ isArray: true, type: Message })
	messages!: Array<Message>;
}
