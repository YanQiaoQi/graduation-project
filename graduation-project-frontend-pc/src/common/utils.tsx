import { message as AntdMessage, message } from 'antd';
import request from './request';

export function navigateTo(path: string) {
    location.pathname = path;
}

interface Result<T = any> {
    code: 0 | 1;
    message: string;
    payload: T;
}

type Handler = (value: any) => void;

message.config({
    maxCount: 1,
});

export async function showMessage(res: Result) {
    const { code, message } = res;
    const messageType = code ? 'success' : 'error';
    const messageDuration = code ? 1 : 3;
    return AntdMessage.open({
        type: messageType,
        content: message,
        duration: messageDuration,
    }).then(() => (code ? Promise.resolve(res) : Promise.reject(res)));
}

export const onAuthFormFinish =
    (url: string, path: string): Handler =>
    (values) => {
        const messageKey = 'message';
        AntdMessage.open({
            key: messageKey,
            type: 'loading',
            content: '',
        });
        request
            .post<Result>(url, { data: values })
            .then(showMessage)
            .then(() => {
                navigateTo(path);
            })
            .catch((e) => {
                console.log(`${e.message}`);
            });
    };

export function getFormData(
    obj: Record<string, string | Blob | string[] | Blob[]>,
) {
    const formData = new FormData();
    for (let key in obj) {
        const value = obj[key];
        if (Array.isArray(value)) {
            for (let item of value) {
                formData.append(key, item);
            }
        } else {
            formData.append(key, value);
        }
    }
    return formData;
}
