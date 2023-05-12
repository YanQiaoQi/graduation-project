export type Email = string;

export type Encryption = "clear" | "AES";

export type Certificate = {
	name: string;
	type: string;
	size: number;
	encryption: Encryption;
	description: string;
	extension: string;
	created: number;
	last_updated: number;
};

export type ColumnEncryption = Record<
	keyof Certificate,
	Encryption
>;

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
	expire: number;
	// 当申请成功时，
	// type 为 download 时，即是下载链接
	// type 为 decrypt 时，即是结果
	data: string;
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

export interface User {
	info: UserInfo;
	password: String;
	columnEncryption: ColumnEncryption;
	certificates: Certificate[];
	// 别人对我发的申请
	othersApplications: ApplyItem[];
	// 我发起的申请
	myApplications: ApplyItem[];
}

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
