import { URL } from '@/common/constant';
import request from '@/common/request';
import { ApplyItem, LedgerItem, Certificate, Result } from '@/common/type';
import { MessageWrapper } from '@/common/utils';

export type DownloadArgus = {
    email: string;
    created: number;
    password: string;
};

export async function download({ email, created, password }: DownloadArgus) {
    return request.post(
        `${URL.CERTIFICATE}/download/${encodeURIComponent(email)}/${created}`,
        {
            responseType: 'blob',
            data: {
                password,
            },
        },
    );
}

export async function getAllCertificates() {
    return request.get<Result<LedgerItem[]>>(`${URL.CERTIFICATE}/all`);
}

export async function applyForDownload(email: string, index: number) {
    return MessageWrapper(
        request.post(
            `${URL.CERTIFICATE}/share/apply/download/${encodeURIComponent(
                email,
            )}/${index}`,
        ),
    );
}

export async function applyForDecrypt(email: string, index: number) {
    return MessageWrapper(
        request.post(
            `${URL.CERTIFICATE}/share/apply/decrypt/${email}/${index}`,
        ),
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
    return request.get<Result<LedgerItem[]>>(
        `${URL.CERTIFICATE}/share/authorizedApplications`,
    );
}
