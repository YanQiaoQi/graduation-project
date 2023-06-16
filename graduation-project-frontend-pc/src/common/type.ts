export type Result<T = any> = {
    status: number;
    message?: string;
    code: 0 | 1;
    data?: T;
};

export type Encryption = 'clear' | 'AES';

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

export type ColumnEncryption = Record<keyof Certificate, Encryption>;

export type Status = 0 | 1;

export type ApplyType = 'download' | keyof EvidenceFieldEncryptionMap;

export type ApplyResult = {
    // true 申请通过，false 申请失败
    code: Status;
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
    created: number;
    auth: AuthItem;
}

export interface AuthCertificate extends Certificate {
    auth: AuthItem;
}

export type FabricRes<T = any> = {
    code: Status;
    message: string;
    data?: T;
};

export type FabricResWithData<T = any> = {
    code: Status;
    message: string;
    data: T;
};

export type ArrayPropOfUser =
    | 'certificates'
    | 'othersApplications'
    | 'myApplications';

export type ItemType = Certificate | ApplyItem;

export type Cipher = string;

export type timeStamp = number;

export type Email = string;

export type Users = Record<Email, User>;

export type EvidenceType = 'video' | 'audio' | 'document' | 'image';

export type FieldEncryption = 'clear' | 'AES';

export type EvidenceEncryption = 'clear' | 'AES';

export type EvidenceFieldEncryptionMap = Record<
    | 'name'
    | 'description'
    | 'type'
    | 'size'
    | 'encryption'
    | 'createTime'
    | 'extension',
    FieldEncryption
>;
type UserInfo = {
	// 性别
	sex: Status;
	// 生日
	birthday: number;
	// 身份证号
	ID: string;
};

export type User = {
	password: string;
	createTime: timeStamp;
	info?: UserInfo;
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
    isDelete?: Status;
    // 是否私有
    isPrivate?: Status;
    access?: Record<Email, (keyof EvidenceFieldEncryptionMap | 'download')[]>;
};

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
    // 当type为decrypt时指向哪一字段
    prop?: keyof EvidenceFieldEncryptionMap;

    // 创建时间
    createTime: number;
    // 结束时间
    endTime?: number;
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
