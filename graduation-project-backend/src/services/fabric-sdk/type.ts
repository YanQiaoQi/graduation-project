export type Cipher = string;

export type timeStamp = number;

export type Email = string;

export type Users = Record<Email, User>;

export type Status = 0 | 1;

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
	evidenceFieldEncryptionMap: EvidenceFieldEncryptionMap;
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
	isDelete: Status;
	// 是否私有
	isPrivate: Status;
	access?: Record<
		Email,
		(keyof EvidenceFieldEncryptionMap | "download")[]
	>;
};

export type Meta = {
	evidence: {
		num: number;
	};
	application: {
		num: number;
	};
};

export type ApplyType = (keyof EvidenceFieldEncryptionMap | "download");

export type ApplyResult = {};

export type Application = {
	id: number;
	// 是否完成
	done: Status;
	// true 申请通过，false 申请失败
	code?: Status;

	// 当申请成功时，设置过期时间
	expire?: number;

	// 申请人 id
	applicantId: Email;
	// 处理人 id
	transactorId: Email;
	// 申请的证据的 id
	evidenceId: number;

	// 申请的资源类型
	type: ApplyType;

	// 创建时间
	createTime: number;
	// 结束时间
	endTime?: number;
};

export type Ledger = {
	meta: Meta;
	users: Users;
	evidences: Evidence[];
	applications: Application[];
};
