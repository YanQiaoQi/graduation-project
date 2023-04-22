export type Email = string;

// 报文
export type Message = string;

export type Encryption = "RSA";

export type FabricRes = {
	code: 1 | 0;
	message: string;
	data?: any;
};

export type Certificate = {
	name: string;
	type: string;
	size: number;
	description: string;
	extension: string;
	created: number;
	last_updated: number;
};

export type Certificates = Certificate[];

export interface User {
	password: String;
	certificates: Certificates;
}

export type Ledger = Record<Email, User>;
