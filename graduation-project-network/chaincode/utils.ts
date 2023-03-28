import { ChaincodeStub } from "fabric-shim";
import { User } from "./types";

export const isEnoughArgus = (
	func: string,
	argus: string[],
	number: Number
) => {
	if (argus.length !== number) {
		throw new Error(` ${func} 调用参数不足`);
	}
};

export const getState = async (
	stub: ChaincodeStub,
	key: string
) => {
	const dataAsBytes = await stub.getState(key);
	if (!dataAsBytes || dataAsBytes.toString().length === 0) {
		throw new Error(`${key}不存在`);
	}
	return JSON.parse(dataAsBytes.toString()) as User;
};

export const putState = async (
	stub: ChaincodeStub,
	key: string,
	value: User
) => {
	stub.putState(key, Buffer.from(JSON.stringify(value)));
};
