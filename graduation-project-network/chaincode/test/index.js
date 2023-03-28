const shim = require("fabric-shim")

export const chaincode = {
	async Init(stub) {
		return shim.success(
			Buffer.from("Initialized Successfully!")
		);
	},

	async Invoke(stub) {
		let {
			fcn,
			params
		} = stub.getFunctionAndParameters();
		// @ts-ignore
		const method = this?.[fcn];
		if (!method) {
			console.shim.error("未找到", fcn, "函数");
		}
		try {
			const payload = await method(stub, params);
			return shim.success(Buffer.from(payload));
		} catch (e) {
			console.log(e);
			return shim.error(Buffer.from(String(e)));
		}
	},
};

shim.start(chaincode);