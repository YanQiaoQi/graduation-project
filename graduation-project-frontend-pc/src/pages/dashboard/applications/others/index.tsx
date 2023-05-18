import {
    Card,
    Space,
    Descriptions,
    Empty,
    Spin,
    Button,
    Form,
    DatePicker,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    getOthersApplications,
    processApplication,
} from '@/service/application';
import useRequest from '@ahooksjs/use-request';
import Container from '@/components/Container';
import { format } from '@/common/utils';
import FormModal from '@/components/FormModal';
import FormItem from '@/components/FormItem';

function OthersApplications() {
    const [modalForm] = Form.useForm();
    const { data, loading, run } = useRequest(getOthersApplications);
    if (loading) {
        return (
            <Card style={{ textAlign: 'center', width: '50%' }}>
                <Spin />
            </Card>
        );
    }

    const ConfirmModal = FormModal<{ expire: any }>({
        form: modalForm,
        formChildren: (
            <FormItem label="过期时间" name="expire" required>
                <DatePicker showTime />
            </FormItem>
        ),
        title: '请确认过期时间',
    });

    const onConfirm = (index: number) => () => {
        ConfirmModal(async ({ expire }) => {
            return processApplication(index, {
                code: 1,
                expire: dayjs(expire).valueOf(),
            }).then((res) => {
                run();
                console.log(res);
            });
        });
    };

    const onCancel = (index: number) => () => {
        processApplication(index, {
            code: 0,
        }).then((res) => {
            run();
            console.log(res);
        });
    };

    return (
        <Container direction="row" align="start" wrap>
            {data?.data?.length === 0 ? (
                <Card title="暂无申请" style={{ width: '50%' }}>
                    <Empty />
                </Card>
            ) : (
                data?.data?.map((application, index) => {
                    const { created, done, type, origin, certificate, result } =
                        application;

                    const doneText = result?.code ? '已同意' : '已拒绝';
                    const doneIcon = result?.code ? (
                        <CheckCircleOutlined
                            style={{ color: 'blue', margin: 4 }}
                        />
                    ) : (
                        <CloseCircleOutlined
                            style={{ color: 'red', margin: 4 }}
                        />
                    );
                    const title = done ? (
                        <span>
                            申请（{doneText}
                            {doneIcon}）
                        </span>
                    ) : (
                        '申请'
                    );

                    return (
                        <Card
                            key={created}
                            title={title}
                            style={{ width: '47%', margin: '0 16px 16px 16px' }}
                            extra={
                                !done && (
                                    <Space size={8}>
                                        <Button
                                            size="small"
                                            type="primary"
                                            onClick={onConfirm(index)}
                                        >
                                            同意
                                        </Button>
                                        <Button
                                            size="small"
                                            type="default"
                                            onClick={onCancel(index)}
                                        >
                                            拒绝
                                        </Button>
                                    </Space>
                                )
                            }
                        >
                            <Container direction="row">
                                <Descriptions column={2}>
                                    <Descriptions.Item label="证据名称">
                                        {certificate.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="证据类型">
                                        {certificate.type}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="创建时间">
                                        {/* @ts-ignore */}
                                        {format('created')(certificate.created)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="申请时间">
                                        {/* @ts-ignore */}
                                        {format('created')(created)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="申请人">
                                        {origin}
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
        </Container>
    );
}

export default OthersApplications;
