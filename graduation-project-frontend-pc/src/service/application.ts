import { URL } from '@/common/constant';
import request from '@/common/request';
import {
    ApplyType,
    Result,
    EvidenceFieldEncryptionMap,
    Evidence,
    Application,
} from '@/common/type';
import { MessageWrapper } from '@/common/utils';

export async function applyForDownload(id: number) {
    return MessageWrapper(
        request.post(`${URL.CERTIFICATE}/share/apply/download/${id}`),
    );
}

export async function applyForDecrypt(
    id: number,
    field: keyof EvidenceFieldEncryptionMap,
) {
    return MessageWrapper(
        request.post(`${URL.CERTIFICATE}/share/apply/${field}/${id}`),
    );
}

export async function getApplications() {
    return request.get(`${URL.CERTIFICATE}/share/application`);
}

export interface ApplicationResBody extends Application {
    evidences: Evidence[];
    fieldEncryption: EvidenceFieldEncryptionMap;
    access: ApplyType[];
}

export async function getApplicantsApplications() {
    return request
        .get<Result<ApplicationResBody[]>>(
            `${URL.CERTIFICATE}/share/applications/applicant`,
        )
        .then((res) => res.data);
}

export async function getTransactorsApplications() {
    return request
        .get<Result<ApplicationResBody[]>>(
            `${URL.CERTIFICATE}/share/applications/transactor`,
        )
        .then((res) => res.data);
}

type ProcessReqBody = {
    code: 0 | 1;
    expire?: number;
};

export async function processApplication(id: number, data: ProcessReqBody) {
    return MessageWrapper(
        request.post(`${URL.CERTIFICATE}/share/process/${id}`, {
            data,
        }),
    );
}

export async function getAuthorizedApplication() {
    return request.get<Result<any[]>>(
        `${URL.CERTIFICATE}/share/authorizedApplications`,
    );
}
