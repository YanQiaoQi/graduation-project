export type Email = string;

// 报文
export type Message = string;

export type Encryption = "RSA" | "clear";

export type FabricRes = {
	code: 1 | 0;
	message: string;
	data?: any;
};

export type Certificate = {
	name: string;
	type: string;
	size: number;
	encryption: string;
	description: string;
	extension: string;
	created: number;
	last_updated: number;
};

export type Certificates = Certificate[];

export type ColumnEncryption = {
	name: Encryption;
	type: Encryption;
	size: Encryption;
	encryption: Encryption;
	description: Encryption;
	extension: Encryption;
	created: Encryption;
};

export type UserInfo = {
	created: number;
};

export interface User {
	info: UserInfo;
	password: String;
	columnEncryption: ColumnEncryption;
	certificates: Certificates;
}

export type Ledger = Record<Email, User>;
