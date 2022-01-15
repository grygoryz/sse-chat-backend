import { ApiProperty } from '@nestjs/swagger';
import { UserId } from '@common/types';

export class UserDTO {
	@ApiProperty()
	id!: UserId;

	@ApiProperty()
	name!: string;
}
