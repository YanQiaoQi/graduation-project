import { Card, Space, Descriptions, Empty, Spin, Button } from 'antd';
import { getOthersApplications } from '@/service/certificate';
import useRequest from '@ahooksjs/use-request';
import Container from '@/components/Container';
import { format } from '@/common/utils';

function OthersApplications() {
    const { data, loading } = useRequest(getOthersApplications);
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
                    const { created, target, type, origin, certificate } =
                        application;

                    return (
                        <Card
                            key={created}
                            title="申请信息"
                            extra={
                                <Space size={8}>
                                    <Button size="small" type="primary">
                                        同意
                                    </Button>
                                    <Button size="small">拒绝</Button>
                                </Space>
                            }
                        >
                            <Container direction="row">
                                <Descriptions>
                                    <Descriptions.Item label="证据名称">
                                        {certificate.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="创建时间">
                                        {/* @ts-ignore */}
                                        {format('created')(certificate.created)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="证据类型">
                                        {certificate.type}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="申请人">
                                        {origin}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="申请时间">
                                        {/* @ts-ignore */}
                                        {format('created')(created)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="申请资源类型">
                                        {type === 'decrypt'
                                            ? '字段信息'
                                            : '下载证据'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Container>
                        </Card>
                    );
                })
            )}
        </Space>
    );
}

export default OthersApplications;
