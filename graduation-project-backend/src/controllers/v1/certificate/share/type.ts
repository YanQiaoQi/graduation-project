import {
	ApplyType,
	Certificate,
} from "../../../../common/type";

export namespace Apply {
	export type ReqParams = {
		type: ApplyType;
		index: string;
		target: string;
	};

	export type ReqBody = {
		prop?: keyof Certificate;
	};
}

export namespace Process {
	export type ReqParams = {
		type: ApplyType;
		index: number;
	};

	export type ReqBody = {
		code: 0 | 1;
		expire: number;
	};
}
