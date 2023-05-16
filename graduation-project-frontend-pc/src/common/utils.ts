import { message as AntdMessage } from 'antd';
import request from './request';
import dayjs from 'dayjs';
import { CERTIFICATE } from './constant';
import { Certificate, CertificateType } from './type';

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

export async function showMessage(res: Result) {
    const { code, message } = res ?? { code: 1, message: '成功' };
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

const formatByte = (size: number) => {
    if (!size) return '';
    if (size < pow1024(1)) return size + ' B';
    if (size < pow1024(2)) return (size / pow1024(1)).toFixed(2) + ' KB';
    if (size < pow1024(3)) return (size / pow1024(2)).toFixed(2) + ' MB';
    if (size < pow1024(4)) return (size / pow1024(3)).toFixed(2) + ' GB';
    return (size / pow1024(4)).toFixed(2) + ' TB';
};

export function format(type: keyof Certificate) {
    switch (type) {
        case 'created': {
            return (value: string) => {
                const res = dayjs(Number(value)).format('YYYY-MM-DD HH:mm:ss');
                return res === 'Invalid Date' ? value : res;
            };
        }
        case 'type': {
            return (value: CertificateType) => CERTIFICATE.TYPE_TO_TEXT[value];
        }
        case 'size': {
            return (value: string) => formatByte(parseInt(value));
        }
        default: {
            return (value: any) => value;
        }
    }
}

// export const MessageWrapper =
//     <Func extends (...args: Parameters<Func>) => any>(service: Func) =>
//     (...argus: Parameters<Func>) => {
//         AntdMessage.open({
//             type: 'loading',
//             content: '',
//         });
//         return service(...argus).then(showMessage);
//     };

export const MessageWrapper = async <T extends Result>(promise: Promise<T>) => {
    AntdMessage.open({
        type: 'loading',
        content: '请稍等',
    });
    return promise.then(showMessage);
};
