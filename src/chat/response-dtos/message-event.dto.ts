import { ApiProperty } from '@nestjs/swagger';
import { eventsTypes } from '../mappings';
import { MessageDTO } from './message.dto';

export class MessageEventDTO {
	@ApiProperty({ enum: [eventsTypes.message] })
	type!: string;

	@ApiProperty({ type: MessageDTO })
	data!: MessageDTO;
}
