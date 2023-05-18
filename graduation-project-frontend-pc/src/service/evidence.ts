import { URL } from '@/common/constant';
import request from '@/common/request';
import { Evidence, Result } from '@/common/type';
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
    evidences: any[];
    fieldEncryption: any;
};

export async function getEvidences() {
    return request
        .get<Result<getEvidencesResBody>>(URL.CERTIFICATE)
        .then((res) => res.data);
}

type DownloadArgus = {
    email: string;
    created: number;
    password: string;
};

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
