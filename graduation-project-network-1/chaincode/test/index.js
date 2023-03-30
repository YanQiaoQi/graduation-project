const shim = require("fabric-shim");

const test = async (stub, argus) => {
    console.log("successful");
};

const chaincode = {
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
        const method = this[fcn];
        if (!method) {
            console.error("未找到", fcn, "函数");
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