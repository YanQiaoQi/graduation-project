import { Method } from "../types";
import {
	isEnoughArgus,
	getState,
	putState,
} from "../utils";

// 登录
export const signin: Method<boolean> = async (
	stub,
	argus
) => {
	isEnoughArgus("signin", argus, 2);
	const [email, inputPwd] = argus;
	const { pwd } = await getState(stub, email);
	return pwd === inputPwd;
};

// 注册
export const signup: Method<void> = async (stub, argus) => {
	isEnoughArgus("signup", argus, 2);
	const [email, pwd] = argus;
	const userInfo = {
		pwd,
	};
	await putState(stub, email, userInfo);
};
