import { ApiProperty } from '@nestjs/swagger';
import { eventsTypes } from '../mappings';
import { MessageDTO } from './message.dto';
import { UserDTO } from './user.dto';

class InitialData {
	@ApiProperty({ type: MessageDTO, isArray: true })
	messages!: Array<MessageDTO>;

	@ApiProperty({ type: UserDTO, isArray: true })
	users!: Array<UserDTO>;
}

export class InitialDataEventDTO {
	@ApiProperty({ enum: [eventsTypes.initialData] })
	type!: string;

	@ApiProperty({ type: InitialData })
	data!: InitialData;
}
