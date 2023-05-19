import { URL } from '@/common/constant';
import request from '@/common/request';
import {
    Email,
    Evidence,
    EvidenceEncryption,
    EvidenceFieldEncryptionMap,
    Result,
} from '@/common/type';
import {
    downloadFileByBlob,
    getFormData,
    MessageWrapper,
} from '@/common/utils';

export type createEvidencesReqBody = {};

// 增
export async function createEvidences(reqBody: createEvidencesReqBody) {
    return MessageWrapper(
        request.post(URL.CERTIFICATE, {
            data: getFormData(reqBody),
        }),
    );
}

// 删
export async function deleteEvidence(id: number) {
    return MessageWrapper(request.delete(`${URL.CERTIFICATE}/${id}`));
}

// 改
export async function updateEvidence(id: number, data: Partial<Evidence>) {
    return MessageWrapper(
        request.put(`${URL.CERTIFICATE}/${id}`, {
            data,
        }),
    );
}

export type getEvidencesResBody = {
    evidences: Evidence[];
    fieldEncryption: EvidenceFieldEncryptionMap;
};

// 查
export async function getEvidences() {
    return request
        .get<Result<getEvidencesResBody>>(URL.CERTIFICATE)
        .then((res) => res.data);
}

export type getAllEvidencesResBody = {
    creator: Email;
    evidences: Evidence[];
    fieldEncryption: EvidenceFieldEncryptionMap;
};

export async function getAllEvidences() {
    return request
        .get<Result<getAllEvidencesResBody[]>>(`${URL.CERTIFICATE}/all`)
        .then((res) => res.data);
}

export async function downloadEvidence(id: number, name: string) {
    return request
        .get(`${URL.CERTIFICATE}/download/${id}`, {
            responseType: 'blob',
        })
        .then((res) => {
            downloadFileByBlob(res, name);
        })
        .catch((e) => {
            console.log(e);
        });
}

// 加密
export async function encryptEvidence(reqBody: EvidenceFieldEncryptionMap) {
    return MessageWrapper(
        request.post(`${URL.CERTIFICATE}/encrypt`, {
            data: reqBody,
        }),
    );
}

// 解密字段
export async function decryptEvidence(id: number, field: keyof Evidence) {
    return MessageWrapper(
        request.get(`${URL.CERTIFICATE}/decrypt/${id}/${field}`),
    );
}
