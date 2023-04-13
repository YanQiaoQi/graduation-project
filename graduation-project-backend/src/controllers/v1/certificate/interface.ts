import { File } from "buffer";

export interface NewCertificateReqBody {
	type: string;
	description: string;
	file: File[];
}
