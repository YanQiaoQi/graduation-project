import { FabricRes } from "../services/fabric-sdk/interface";

export type Result<T = any> = {
	status: number;
	message?: string;
	code: 0 | 1;
	data?: T;
};

export const Res = {
	create: (fabricRes: FabricRes, status = 200): Result => {
		const { code, message, data } = fabricRes;
		return {
			status,
			message: message,
			code,
			data,
		};
	},
	success: (
		message: string,
		status = 200,
		other = {}
	): Result => ({
		status,
		message,
		code: 1,
		...other,
	}),

	fail: (
		message: string,
		status = 200,
		other = {}
	): Result => ({
		status,
		message,
		code: 0,
		...other,
	}),
};

export default Res;
