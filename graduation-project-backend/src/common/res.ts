import { FabricRes, Result } from "./type";

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
