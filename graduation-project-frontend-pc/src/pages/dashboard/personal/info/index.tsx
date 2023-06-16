import { useContext, useCallback, ReactNode } from 'react';
import { Card, Descriptions, Tag } from 'antd';
import { UserContext } from '@/common/contexts';
import useRequest from '@ahooksjs/use-request';
import { getUserInfo, updateUserInfo } from '@/service/user';
import FormModal from '@/components/FormModal';
import FormItem from '@/components/FormItem';
import { format } from '@/common/utils';
import { Status } from '@/common/type';

type ModalValues = {
    sex: Status;
    ID: string;
};

interface PersonalInfoPageProps {
    children: ReactNode;
    onClick: any;
}

function DescriptionTag({ children, onClick }: PersonalInfoPageProps) {
    return (
        <span style={{ marginLeft: 8 }}>
            <Tag color={'blue'} onClick={onClick} style={{ cursor: 'pointer' }}>
                {children}
            </Tag>
        </span>
    );
}

function PersonalInfoPage() {
    const { data: userInfo, run } = useRequest(getUserInfo);

    const { email } = useContext(UserContext);

    const modal = FormModal<ModalValues>(
        <>
            <FormItem.Select
                label="性别"
                name="sex"
                items={[
                    { label: '男', value: 1 },
                    { label: '女', value: 0 },
                ]}
            />
            <FormItem.Input
                label="身份证号"
                name="ID"
                rules={[
                    {
                        pattern: /(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                        message: '身份证号错误',
                    },
                ]}
            />
        </>,
    );

    const onUpdateUserInfo = useCallback(() => {
        modal()
            .then((res) => {
                if (!res.sex && !res.ID) return;
                return updateUserInfo(res);
            })
            .then(() => {
                run();
            });
    }, []);

    return (
        <Card title="基本信息">
            <Descriptions column={2}>
                <Descriptions.Item label="用户名">{email}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{email}</Descriptions.Item>
                <Descriptions.Item label="注册时间">
                    {format('time')(userInfo?.createTime)}
                </Descriptions.Item>
                <Descriptions.Item label="性别">
                    {format('sex')(userInfo?.sex)}
                    <DescriptionTag onClick={onUpdateUserInfo}>
                        {userInfo?.sex ? '去修改' : '去完善'}
                    </DescriptionTag>
                </Descriptions.Item>
                <Descriptions.Item label="生日">
                    {userInfo?.ID?.substring(6, 14)}
                    <DescriptionTag onClick={onUpdateUserInfo}>
                        {userInfo?.ID ? '去修改' : '去完善'}
                    </DescriptionTag>
                </Descriptions.Item>
                <Descriptions.Item label="身份证号">
                    {userInfo?.ID}
                    <DescriptionTag onClick={onUpdateUserInfo}>
                        {userInfo?.ID ? '去修改' : '去完善'}
                    </DescriptionTag>
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
}

export default PersonalInfoPage;
