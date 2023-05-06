import { message as AntdMessage, message } from 'antd';
import request from './request';

export function navigateTo(path: string) {
    location.pathname = path;
}

export function onNavigateTO(path: string) {
    return function () {
        location.pathname = path;
    };
}

interface Result<T = any> {
    code: 0 | 1;
    message: string;
    payload: T;
    token?: string;
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
    (url: string, path: string, cb?: (res: Result) => void): Handler =>
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
            .then((res) => {
                cb?.(res);
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

export function downloadFileByBlob(blob: Blob, filename: string) {
    const blobURL = window.URL.createObjectURL(blob);
    const eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    eleLink.href = blobURL;
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
    window.URL.revokeObjectURL(blobURL);
}

function pow1024(num: number) {
    return Math.pow(1024, num);
}

export const formatByte = (size: number) => {
    if (!size) return '';
    if (size < pow1024(1)) return size + ' B';
    if (size < pow1024(2)) return (size / pow1024(1)).toFixed(2) + ' KB';
    if (size < pow1024(3)) return (size / pow1024(2)).toFixed(2) + ' MB';
    if (size < pow1024(4)) return (size / pow1024(3)).toFixed(2) + ' GB';
    return (size / pow1024(4)).toFixed(2) + ' TB';
};


