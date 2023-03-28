import { ChaincodeStub } from "fabric-shim";
import { Method } from "../types";

export const upload: Method<void> = async (
	stub: ChaincodeStub
) => {};

export const download: Method<void> = async (
	stub: ChaincodeStub
) => {};
