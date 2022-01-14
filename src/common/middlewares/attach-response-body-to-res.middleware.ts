import { Request, Response, NextFunction } from 'express';

// need for response body logging
export const attachResponseBodyToRes = (req: Request, res: Response, next: NextFunction) => {
	const send = res.send;
	res.send = value => {
		res.locals.body = value;
		res.send = send;
		return res.send(value);
	};
	next();
};
