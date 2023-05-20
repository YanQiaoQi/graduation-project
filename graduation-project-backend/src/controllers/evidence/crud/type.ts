import {
	Evidence,
	EvidenceEncryption,
	EvidenceType,
} from "../../../services/fabric-sdk/type";
import { AuthReqBody } from "../interface";

export namespace NewCertificate {
	export type ReqBody = {
		name: string;
		type: EvidenceType;
		description: string;
		encryption: EvidenceEncryption;
		isPrivate: "0" | "1";
		file: File[];
	};
}

export namespace DeleteCertificate {
	export type ReqParams = {
		id: string;
	};
	export type ReqBody = Partial<
		Record<Exclude<keyof Evidence, "id">, string>
	>;
}
