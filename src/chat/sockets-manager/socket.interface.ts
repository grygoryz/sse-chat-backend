export interface Socket {
	emit: (data: any) => void;
	disconnect: () => void;
}
