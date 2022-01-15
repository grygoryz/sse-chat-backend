import { ApiProperty } from '@nestjs/swagger';
import { eventsTypes } from '../mappings';
import { UserId } from '@common/types';

class UserDisconnectedEventData {
	@ApiProperty()
	id!: UserId;
}

export class UserDisconnectedEventDTO {
	@ApiProperty({ enum: [eventsTypes.userConnected] })
	type!: string;

	@ApiProperty({ type: UserDisconnectedEventData })
	data!: UserDisconnectedEventData;
}
