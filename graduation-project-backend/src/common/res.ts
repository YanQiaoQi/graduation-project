export type Result<T = any> = {
	status: number;
	message: string;
	code: 0 | 1;
	data?: T;
};

export const Res = {
	success: (message: string, status = 200): Result => ({
		status,
		message,
		code: 1,
	}),

	fail: (message: string, status = 200): Result => ({
		status,
		message,
		code: 0,
	}),
};

export default Res;
