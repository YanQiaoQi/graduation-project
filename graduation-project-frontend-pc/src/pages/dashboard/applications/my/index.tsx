import { Card, Space, Spin, Empty } from 'antd';
import { getMyApplications } from '@/service/certificate';
import useRequest from '@ahooksjs/use-request';
import Container from '@/components/Container';
import {
    ApplicationDescription,
    CertificateDescription,
} from '../../components/Description';

function MyApplications() {
    const { data, loading } = useRequest(getMyApplications);
    if (loading) {
        return (
            <Card style={{ textAlign: 'center' }}>
                <Spin />
            </Card>
        );
    }

    return (
        <Space size={16} direction="vertical" style={{ width: '100%' }}>
            {data?.data?.length === 0 ? (
                <Card title="暂无申请">
                    <Empty />
                </Card>
            ) : (
                data?.data?.map((application) => {
                    const { created, done, certificate } = application;

                    const doneText = done ? '已完成' : '未完成';

                    return (
                        <Card key={created} title={`申请（${doneText}）`}>
                            <Container direction="row">
                                <ApplicationDescription item={application} />
                                <CertificateDescription item={certificate} />
                            </Container>
                        </Card>
                    );
                })
            )}
        </Space>
    );
}

export default MyApplications;
