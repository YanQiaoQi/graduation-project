import { Encryption } from "../../../../common/type";
import { AuthReqBody } from "../interface";

export namespace DecryptCertificateProp {
	export type ReqParams = {
		encryption: Encryption;
		data: string;
	};
	export type ReqBody = AuthReqBody;
}
