export const eventsTypes = {
	userConnected: 'users:user_connected',
	userDisconnected: 'users:user_disconnected',
	message: 'messages:message',
	initialData: 'common:initial_data',
} as const;

export const messagesPageSize = 30;

export const maxMessagesCount = 1000;
