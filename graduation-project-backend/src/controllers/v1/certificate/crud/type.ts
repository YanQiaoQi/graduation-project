import { Encryption } from "../../../../common/type";
import { AuthReqBody } from "../interface";

export namespace NewCertificate {
	export type ReqBody = {
		name: string;
		type: string;
		description: string;
		encryption: Encryption;
		file: File[];
	};
}

export namespace DeleteCertificate {
	export type ReqParams = {
		index: string;
	};
	export type ReqBody = AuthReqBody;
}
