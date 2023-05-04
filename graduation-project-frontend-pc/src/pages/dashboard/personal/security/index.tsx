import { Card, Tabs, Button, Descriptions, Tag } from 'antd';
import { useEffect, useState, useMemo, useCallback } from 'react';
import request from '@/common/request';
import { URL } from '@/common/constant';
import { onNavigateTO } from '@/common/utils';

interface SecurityPageProps {}

const tabList = [
    // { key: '0', tab: '实名认证' },
    { key: '1', tab: '绑定手机' },
    { key: '2', tab: '修改密码' },
];

const contentList = [];

function SecurityPage({}: SecurityPageProps) {
    const [tabKey, setTabKey] = useState('0');

    const [userInfo, setuserInfo] = useState<Record<string, string>>({});

    const hasKYC = useMemo(() => userInfo?.hasOwnProperty('ID'), [userInfo]);

    const hasKYCText = useMemo(() => (hasKYC ? '已实名' : '未实名'), [hasKYC]);

    const onTabChange = useCallback((value) => {
        setTabKey(value);
    }, []);

    useEffect(() => {
        request.get(URL.USER).then(({ data }) => {
            setuserInfo(data.info);
        });
    }, []);

    return (
        <Card
            title="安全中心"
            activeTabKey={tabKey}
            tabList={tabList}
            onTabChange={onTabChange}
        ></Card>
    );
}

export default SecurityPage;
