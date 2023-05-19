import { URL } from '@/common/constant';
import request from '@/common/request';
import {
    ApplyItem,
    Certificate,
    Result,
    EvidenceFieldEncryptionMap,
    Evidence,
} from '@/common/type';
import { MessageWrapper } from '@/common/utils';

export async function applyForDownload(id: number) {
    return MessageWrapper(
        request.post(`${URL.CERTIFICATE}/share/apply/download/${id}`),
    );
}

export async function applyForDecrypt(id: number, field: keyof Evidence) {
    return MessageWrapper(
        request.post(`${URL.CERTIFICATE}/share/apply/decrypt/${id}/${field}`),
    );
}

export async function getApplications() {
    return request.get(`${URL.CERTIFICATE}/share/application`);
}

interface MyApplication extends ApplyItem {
    certificate: Certificate;
}

export async function getMyApplications() {
    return request.get<Result<MyApplication[]>>(
        `${URL.CERTIFICATE}/share/myApplications`,
    );
}

export async function getOthersApplications() {
    return request.get<Result<MyApplication[]>>(
        `${URL.CERTIFICATE}/share/othersApplications`,
    );
}

type ProcessReqBody = {
    code: 0 | 1;
    expire?: number;
};

export async function processApplication(index: number, data: ProcessReqBody) {
    return MessageWrapper(
        request.post(`${URL.CERTIFICATE}/share/process/${index}`, {
            data,
        }),
    );
}

export async function getAuthorizedApplication() {
    return request.get<Result<any[]>>(
        `${URL.CERTIFICATE}/share/authorizedApplications`,
    );
}
