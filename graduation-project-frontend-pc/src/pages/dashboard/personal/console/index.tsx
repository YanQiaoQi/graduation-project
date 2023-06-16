import { useContext, useMemo } from 'react';
import { Card, Button, Space, Descriptions } from 'antd';
import useRequest from '@ahooksjs/use-request';
import { EvidenceType } from '@/common/type';
import { CERTIFICATE } from '@/common/constant';
import { UserContext } from '@/common/contexts';
import { format } from '@/common/utils';
import { getEvidences } from '@/service/evidence';
import { getUserInfo } from '@/service/user';
import DemoPie from './Pie';

interface PersonalConsoleProps {}

function PersonalConsole({}: PersonalConsoleProps) {
    const { data, loading } = useRequest(getEvidences);
    const { data: userInfo, run } = useRequest(getUserInfo);
    const { email } = useContext(UserContext);
    const pieData = useMemo(() => {
        const res = { video: 0, audio: 0, document: 0, image: 0 };
        data?.evidences?.forEach((e) => {
            if (res[e?.type as EvidenceType] !== undefined) {
                res[e?.type as EvidenceType]++;
            }
        });
        const result = [];
        for (let type in res) {
            result.push({
                type: CERTIFICATE.TYPE_TO_TEXT[type as EvidenceType],
                value: res[type as EvidenceType],
            });
        }

        return result;
    }, [data]);

    return (
        <Space direction="vertical">
            <Card
                title="证据中心"
                extra={
                    <Button href="/dashboard/certificates/new">
                        + 新建证据
                    </Button>
                }
            >
                {!loading && <DemoPie data={pieData} />}
            </Card>
            <Card
                title="基本信息"
                extra={
                    <Button href="/dashboard/personal/info">
                        去修改
                    </Button>
                }
            >
                <Descriptions column={2}>
                    <Descriptions.Item label="用户名">
                        {email}
                    </Descriptions.Item>
                    <Descriptions.Item label="邮箱">{email}</Descriptions.Item>
                    <Descriptions.Item label="注册时间">
                        {format('time')(userInfo?.createTime)}
                    </Descriptions.Item>
                    {userInfo?.sex !== undefined && (
                        <Descriptions.Item label="性别">
                            {format('sex')(userInfo?.sex)}
                        </Descriptions.Item>
                    )}
                    {userInfo?.ID && (
                        <>
                            <Descriptions.Item label="生日">
                                {userInfo?.ID?.substring(6, 14)}
                            </Descriptions.Item>
                            <Descriptions.Item label="身份证号">
                                {userInfo?.ID}
                            </Descriptions.Item>
                        </>
                    )}
                </Descriptions>
            </Card>
        </Space>
    );
}

export default PersonalConsole;
