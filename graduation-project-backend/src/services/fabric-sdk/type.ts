export type Cipher = string;

export type timeStamp = number;

export type Email = string;

export type Users = Record<Email, User>;

export type EvidenceType =
	| "video"
	| "audio"
	| "document"
	| "image";

export type FieldEncryption = "clear" | "AES";

export type EvidenceEncryption = "clear" | "AES";

export type EvidenceFieldEncryptionMap = Record<
	| "name"
	| "description"
	| "type"
	| "size"
	| "encryption"
	| "createTime"
	| "extension",
	FieldEncryption
>;

export type User = {
	password: string;
	createTime: timeStamp;
	EvidenceFieldEncryptionMap: EvidenceFieldEncryptionMap;
};

export type Evidence = {
	id: number;
	// 创建者 id
	creatorId: Email;
	// 证据名称
	name: string;
	// 证据描述
	description: string;
	// 证据类型
	type: EvidenceType | Cipher;
	// 证据文件内存大小
	size: number | Cipher;
	// 证据文件加密方式
	encryption: EvidenceEncryption;
	// 证据文件拓展名
	extension: string | Cipher;
	createTime: timeStamp | Cipher;
	updateTime: timeStamp;
	// 是否已经删除
	isDelete: 0 | 1;
	// 是否私有
	isPrivate: 0 | 1;
};

export type Meta = {
	evidence: {
		num: number;
	};
};

export type Ledger = {
	meta: Meta;
	users: Users;
	evidences: Evidence[];
};
