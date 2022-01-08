import { eventsTypes } from '../mappings';

export interface EventBO {
	type: typeof eventsTypes[keyof typeof eventsTypes];
	data: any;
}
