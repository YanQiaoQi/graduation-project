import { useEffect, useState, useMemo, useContext } from 'react';
import { Button, Card, Descriptions, Tag } from 'antd';
import { UserContext } from '@/common/contexts';
import dayjs from 'dayjs';

interface PersonalInfoPageProps {}

function PersonalInfoPage({}: PersonalInfoPageProps) {
    const [userInfo, setuserInfo] = useState<Record<string, string>>({});

    const hasKYC = useMemo(() => userInfo?.hasOwnProperty('ID'), [userInfo]);

    const hasKYCText = useMemo(() => (hasKYC ? '已实名' : '未实名'), [hasKYC]);

    const user = useContext(UserContext);

    // useEffect(() => {
        // request.get(URL.USER).then(({ data }) => {
            // setuserInfo(data.info);
        // });
    // }, []);

    return (
        <Card title="基本信息">
            <Descriptions column={2}>
                <Descriptions.Item label="用户名">
                    {user.email}
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
                <Descriptions.Item label="注册时间">
                    {dayjs(userInfo['created']).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                {/* <Descriptions.Item label="个人实名">
                    {hasKYCText}
                    {!hasKYC && (
                        <span style={{ marginLeft: 8 }}>
                            <Tag color={'blue'} onClick={onNavigateTO('/dashboard/personal/security')} style={{cursor:"pointer"}}>
                                去实名
                            </Tag>
                        </span>
                    )}
                </Descriptions.Item> */}
            </Descriptions>
        </Card>
    );
}

export default PersonalInfoPage;
