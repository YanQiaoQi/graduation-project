import { File } from "buffer";

export interface NewCertificateReqBody {
	name: string;
	type: string;
	description: string;
	file: File[];
}
