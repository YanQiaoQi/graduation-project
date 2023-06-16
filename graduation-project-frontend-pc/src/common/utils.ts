import { message as AntdMessage } from 'antd';
import dayjs from 'dayjs';
import { CERTIFICATE } from './constant';
import {
    Application,
    Certificate,
    Evidence,
    EvidenceType,
    Result,
    Status,
} from './type';

export function navigateTo(path: string) {
    location.pathname = path;
}

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

function formatTime(value: string | number) {
    const res = dayjs(Number(value)).format('YYYY-MM-DD HH:mm:ss');
    return res === 'Invalid Date' ? value : res;
}

function formatByte(value: number | string) {
    function pow1024(num: number) {
        return Math.pow(1024, num);
    }
    const size = Number(value);
    if (!size) return '';
    if (size < pow1024(1)) return size + ' B';
    if (size < pow1024(2)) return (size / pow1024(1)).toFixed(2) + ' KB';
    if (size < pow1024(3)) return (size / pow1024(2)).toFixed(2) + ' MB';
    if (size < pow1024(4)) return (size / pow1024(3)).toFixed(2) + ' GB';
    return (size / pow1024(4)).toFixed(2) + ' TB';
}

function formatSex(value?: Status) {
    return value !== null && value !== undefined
        ? value === 1
            ? '男'
            : '女'
        : undefined;
}

export function format(type: string): (value: any) => any {
    if (/.*Time/.test(type) || type === 'expire' || type?.includes('time')) {
        return formatTime;
    } else
        switch (type) {
            case 'type': {
                return (value: string) =>
                    // @ts-ignore
                    CERTIFICATE.TYPE_TO_TEXT[value] ?? value;
            }
            case 'size': {
                return formatByte;
            }
            case 'sex': {
                return formatSex;
            }
            default: {
                return (value: any) => value;
            }
        }
}

export const MessageWrapper = async <T = any>(service: Promise<Result<T>>) => {
    AntdMessage.open({
        key: 'message',
        type: 'loading',
        duration: 10,
        content: '请稍等',
    });
    return service.then((res: Result<T>) => {
        AntdMessage.open({
            key: 'message',
            type: res.code ? 'success' : 'error',
            duration: res.code ? 1 : 3,
            content: res.message,
        });
        return Promise[res.code ? 'resolve' : 'reject'](res.data ?? res);
    });
};
