import { ApiProperty } from '@nestjs/swagger';
import { eventsTypes } from '../mappings';
import { UserDTO } from './user.dto';

export class UserConnectedEventDTO {
	@ApiProperty({ enum: [eventsTypes.userConnected] })
	type!: string;

	@ApiProperty({ type: UserDTO })
	data!: UserDTO;
}
