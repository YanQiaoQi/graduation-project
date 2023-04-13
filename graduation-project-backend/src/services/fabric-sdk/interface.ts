export type Email = string;

// 报文
export type Message = string;

export type Encryption = "RSA";

// 起始次序，结束次序，加密方式
// export type EncryptionItem = [number, number, Encryption];

// export type Certificate = {
// 	// 原文信息
// 	content: string;
// 	encryptio: EncryptionItem[];
// };

export type CertificateItem = [Message, Encryption];

export type Certificate = CertificateItem[];

export interface User {
	password: String;
	certificates: Certificate[];
}

export type Ledger = Record<Email, User>;
