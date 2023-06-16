import React from 'react';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { LaptopOutlined, UserOutlined } from '@ant-design/icons';
import { ColumnEncryption, EvidenceFieldEncryptionMap } from './type';

const version = 2;

const BASIC_URL = `http://localhost:3000/v${version}`;

// URL

export const URL = {
    AUTH: {
        loginByPwd: `${BASIC_URL}/user/login/pwd`,
        loginByCaptcha: `${BASIC_URL}/user/login/captcha`,
        signup: `${BASIC_URL}/user/signup`,
        captcha: `${BASIC_URL}/user/captcha`,
        resetPwd: `${BASIC_URL}/user/resetPwd`,
    },
    CERTIFICATE: `${BASIC_URL}/certificate`,
    USER: `${BASIC_URL}/user`,
};

export const CERTIFICATE = {
    TYPE: {
        VIDEO: 'video',
        AUDIO: 'audio',
        DOCUMENT: 'document',
        IMAGE: 'image',
    },
    TYPE_TO_TEXT: {
        video: '视频',
        audio: '音频',
        document: '文档',
        image: '图片',
    },
    TYPE_TO_ACCEPT: {
        video: 'video/*',
        audio: 'audio/*',
        document: '',
        image: 'image/*',
    },
    TYPE_TO_MAX_SIZE: {
        video: 200 * 1024 * 1024,
        audio: 200 * 1024 * 1024,
        document: 50 * 1024 * 1024,
        image: 50 * 1024 * 1024,
    },
    ITEMS: [
        {
            label: '视频',
            value: 'video',
        },
        {
            label: '音频',
            value: 'audio',
        },
        {
            label: '文档',
            value: 'document',
        },
        {
            label: '图片',
            value: 'image',
        },
    ],
};

export const ENCRYPTION_ITEMS_MAP = {
    video: [
        {
            label: '明文',
            value: 'clear',
        },
        {
            label: 'AES',
            value: 'AES',
        },
        {
            label: 'RSA',
            value: 'RSA',
        },
    ],
    audio: [
        {
            label: '明文',
            value: 'clear',
        },
        {
            label: 'AES',
            value: 'AES',
        },
        {
            label: 'RSA',
            value: 'RSA',
        },
    ],
    document: [
        {
            label: '明文',
            value: 'clear',
        },
        {
            label: 'AES',
            value: 'AES',
        },
        {
            label: 'RSA',
            value: 'RSA',
        },
    ],
    image: [
        {
            label: '明文',
            value: 'clear',
        },
        {
            label: 'AES',
            value: 'AES',
        },
        {
            label: 'RSA',
            value: 'RSA',
        },
    ],
    text: [
        {
            label: '明文',
            value: 'clear',
        },
        {
            label: 'AES',
            value: 'AES',
        },
        {
            label: 'RSA',
            value: 'RSA',
        },
    ],
};

type Map<T = string> = Record<string, T>;

type a = {
    VALUE_TO_LABEL: Map;
    ITEMS_MAP: Map<any>;
};

export const ENCRYPTION: a = {
    VALUE_TO_LABEL: {
        clear: '明文',
        AES: 'AES',
        RSA: 'RSA',
    },
    ITEMS_MAP: ENCRYPTION_ITEMS_MAP,
};

export const defaultColumnEncryption: EvidenceFieldEncryptionMap = {
    name: 'clear',
    type: 'clear',
    encryption: 'clear',
    size: 'clear',
    description: 'clear',
    extension: 'clear',
    createTime: 'clear',
};

type Page = 'NAV' | 'SIDER';

export const PAGE_ITEMS = {
    NAV: [`1`, `2`, `3`].map((key) => ({
        key,
        label: `nav ${key}`,
    })),
    SIDER: [
        {
            key: `personal`,
            label: `个人中心`,
            icon: React.createElement(UserOutlined),
            children: [
                {
                    key: `console`,
                    label: `操作台`,
                },
                {
                    key: `info`,
                    label: `基本信息`,
                },
                // {
                //     key: `security`,
                //     label: `安全中心`,
                // },
            ],
        },
        {
            key: `certificates`,
            label: `证据中心`,
            icon: React.createElement(LaptopOutlined),
            children: [
                {
                    key: `guide`,
                    label: `操作引导`,
                },
                {
                    key: `new`,
                    label: `新建证据`,
                },
                {
                    key: `list`,
                    label: `证据列表`,
                },
                {
                    key: `all`,
                    label: `证据库`,
                },
            ],
        },
        {
            key: `applications`,
            label: `申请中心`,
            icon: React.createElement(LaptopOutlined),
            children: [
                {
                    key: `my`,
                    label: `我的申请`,
                },
                {
                    key: `others`,
                    label: `他人申请`,
                },
            ],
        },
    ],
};
