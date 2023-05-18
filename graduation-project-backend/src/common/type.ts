import { EvidenceFieldEncryptionMap } from "../services/fabric-sdk/type";

export type Result<T = any> = {
	status: number;
	message?: string;
	code: 0 | 1;
	data?: T;
};

export type Email = string;

export type Encryption = "clear" | "AES";

export type Certificate = {
	name: string;
	type: string;
	size: number | string;
	encryption: Encryption;
	description: string;
	extension: string;
	created: number | string;
	last_updated: number;
};

export type ColumnEncryption = EvidenceFieldEncryptionMap

export type UserInfo = {
	created: number;
};

export type ApplyType = "download" | "decrypt";

export type ApplyResult = {
	// true 申请通过，false 申请失败
	code: 0 | 1;
	// 结束时间
	endTime: number;
	// 当申请成功时，设置过期时间
	expire?: number;
	// 当申请成功时，
	// type 为 download 时，即是下载链接
	// type 为 decrypt 时，即是结果
	data?: string;
};

export type ApplyItem = {
	// 是否完成
	done: boolean;
	// 申请的资源类型
	type: ApplyType;
	// 向target申请资源
	origin: string;
	// 向target申请资源
	target: string;
	// 申请序列为 index 的资源
	index: number;
	// 当type为decrypt时指向哪一字段
	prop?: keyof Certificate;
	// 创建时间
	created: number;
	// done 为 true 时显示结果
	result?: ApplyResult;
};

export type AuthItem = {
	type: ApplyType;
	expire: number;
	prop?: keyof Certificate;
};

export interface AuthorizedItem {
	created: number | string;
	auth: AuthItem;
}

export interface AuthCertificate extends Certificate {
	auth: AuthItem;
}

export interface User {
	info: UserInfo;
	password: String;
	columnEncryption: ColumnEncryption;
	certificates: Certificate[];
	// 别人对我发的申请
	othersApplications: ApplyItem[];
	// 我发起的申请
	myApplications: ApplyItem[];
	// 获取权限的他人的证据
	authorizedCertificates: Record<Email, AuthorizedItem[]>;
}

export type LedgerItem = {
	user: Email;
	columnEncryption: ColumnEncryption;
	certificates: AuthCertificate[];
};

export type Ledger = Record<Email, User>;

export type FabricRes<T = any> = {
	code: 1 | 0;
	message: string;
	data?: T;
};

export type FabricResWithData<T = any> = {
	code: 1 | 0;
	message: string;
	data: T;
};

export type ArrayPropOfUser =
	| "certificates"
	| "othersApplications"
	| "myApplications";

export type ItemType = Certificate | ApplyItem;
