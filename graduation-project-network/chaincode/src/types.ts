import { ChaincodeStub } from "fabric-shim";

export type Method<T> = (
	stub: ChaincodeStub,
	args: string[]
) => Promise<T>;

export type Email = string;

export type User = {
	pwd: string;
};

export type Ledger = Record<Email, User>;
