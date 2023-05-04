import React from 'react';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { LaptopOutlined, UserOutlined } from '@ant-design/icons';

const BASIC_URL = 'http://localhost:3000/v1';

// URL

export const URL = {
    AUTH: {
        loginByPwd: `${BASIC_URL}/auth/login/pwd`,
        loginByCaptcha: `${BASIC_URL}/auth/login/captcha`,
        signup: `${BASIC_URL}/auth/signup`,
        captcha: `${BASIC_URL}/auth/captcha`,
        resetPwd: `${BASIC_URL}/auth/resetPwd`,
    },
    CERTIFICATE: `${BASIC_URL}/certificate`,
    USER: `${BASIC_URL}/user`,
};

// Certificate

export type CertificateType =
    | 'video'
    | 'audio'
    | 'document'
    | 'image'
    | 'webpage';

export const CERTIFICATE = {
    TYPE: {
        VIDEO: 'video',
        AUDIO: 'audio',
        DOCUMENT: 'document',
        IMAGE: 'image',
        WEBPAGE: 'webpage',
    },
    TYPE_TO_TEXT: {
        video: '视频',
        audio: '音频',
        document: '文档',
        image: '图片',
        webpage: '网页',
    },
    TYPE_TO_ACCEPT: {
        video: 'video/*',
        audio: 'audio/*',
        document: '',
        image: 'image/*',
        webpage: '',
    },
    TYPE_TO_MAX_SIZE: {
        video: 200 * 1024 * 1024,
        audio: 200 * 1024 * 1024,
        document: 50 * 1024 * 1024,
        image: 50 * 1024 * 1024,
        webpage: '',
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
        {
            label: '网页',
            value: 'webpage',
        },
    ],
};

export const ENCRYPTION_ITEMS_MAP = {
    video: [],
    audio: [],
    document: [],
    image: [
        {
            label: 'AES',
            value: 'AES',
        },
    ],
};

type Page = 'NAV' | 'SIDER';

export const PAGE_ITEMS: Record<Page, ItemType[]> = {
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
            ],
        },
    ],
};
