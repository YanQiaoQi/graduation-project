import { URL } from '@/common/constant';
import request from '@/common/request';
import { ApplyItem, Certificate, Result } from '@/common/type';
import { MessageWrapper } from '@/common/utils';

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
