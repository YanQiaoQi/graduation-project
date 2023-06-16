import { URL } from '@/common/constant';
import request from '@/common/request';
import { Result, Email } from '@/common/type';
import { MessageWrapper } from '@/common/utils';

export async function signup(argus: any) {
    return request.post<Result<{ token: string }>>(URL.AUTH.signup, {
        data: argus,
    });
}

export async function getUserInfo() {
    return request
        .get<Result<{ ID: string; sex: 1 | 0; createTime: number }>>(URL.USER)
        .then((res) => res.data);
}

export async function updateUserInfo(reqBody: any) {
    return MessageWrapper(
        request.post(URL.USER, {
            data: reqBody,
        }),
    );
}

type isAuthorizedResBody = { email: Email };

export async function isAuthorized() {
    return request
        .get<Result<isAuthorizedResBody>>(`${URL.USER}/isAuthorized`)
        .then(({ data }) => data);
}
