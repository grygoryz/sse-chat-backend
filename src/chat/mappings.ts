export const eventsTypes = {
	userConnected: 'users:user_connected',
	userDisconnected: 'users:user_disconnected',
	messagesList: 'messages:list',
	message: 'messages:message',
	initialData: 'common:initial_data',
} as const;

export const messagesPageSize = 30;
