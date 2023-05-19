import { Encryption } from "../../../common/type";
import { EvidenceFieldEncryptionMap } from "../../../services/fabric-sdk/type";
import { AuthReqBody } from "../interface";

export namespace DecryptCertificateProp {
	export type ReqParams = {
		id: string;
		field: keyof EvidenceFieldEncryptionMap;
	};
	export type ReqBody = AuthReqBody;
}
