const BASIC_URL = 'http://localhost:3000/v1';

export const AUTH_URL = {
    loginByPwd: `${BASIC_URL}/auth/login/pwd`,
    loginByCaptcha: `${BASIC_URL}/auth/login/captcha`,
    signup: `${BASIC_URL}/auth/signup`,
    captcha: `${BASIC_URL}/auth/captcha`,
    resetPwd: `${BASIC_URL}/auth/resetPwd`,
};
