import { MessageBO } from './message.bo';

export interface MessagesResponseBO {
	messages: Array<MessageBO>;
	total: number;
}
