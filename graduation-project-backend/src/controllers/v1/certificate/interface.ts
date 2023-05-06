import { File } from "buffer";

export type Encryption = "AES";

export interface NewCertificateReqBody {
	name: string;
	type: string;
	description: string;
	encryption: Encryption;
	file: File[];
}
