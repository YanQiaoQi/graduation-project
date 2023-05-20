import { URL } from '@/common/constant';
import request from '@/common/request';
import { Result, Email } from '@/common/type';

export async function signup(argus: any) {
    return request.post(URL.AUTH.signup, {
        data: argus,
    });
}

type isAuthorizedResBody = { email: Email };

export async function isAuthorized() {
    return request
        .get<Result<isAuthorizedResBody>>(`${URL.USER}/isAuthorized`)
        .then(({ data }) => data);
}
