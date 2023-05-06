import { File } from "buffer";

export type Encryption = "AES" | "clear";

export interface NewCertificateReqBody {
	name: string;
	type: string;
	description: string;
	encryption: Encryption;
	file: File[];
}
