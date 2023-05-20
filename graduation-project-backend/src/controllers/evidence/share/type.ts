import {
	EvidenceFieldEncryptionMap,
	ApplyType,
} from "../../../services/fabric-sdk/type";

export namespace Apply {
	export type ReqParams = {
		type: ApplyType;
		id: string;
	};

	export type ReqBody = {
		prop?: keyof EvidenceFieldEncryptionMap;
	};
}

export namespace Process {
	export type ReqParams = {
		id: string;
	};

	export type ReqBody = {
		code: "0" | "1";
		expire?: number;
	};
}
