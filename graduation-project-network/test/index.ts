import {
	ChaincodeInterface,
	success,
	error,
	start,
} from "fabric-shim";

export const chaincode: ChaincodeInterface = {
	async Init(stub) {
		return success(
			Buffer.from("Initialized Successfully!")
		);
	},

	async Invoke(stub) {
		let { fcn, params } = stub.getFunctionAndParameters();
		// @ts-ignore
		const method = methods?.[fcn];
		if (!method) {
			console.error("未找到", fcn, "函数");
		}
		try {
			const payload = await method(stub, params);
			return success(Buffer.from(payload));
		} catch (e) {
			console.log(e);
			return error(Buffer.from(String(e)));
		}
	},
};

start(chaincode);
