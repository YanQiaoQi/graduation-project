import { Descriptions, DescriptionsProps } from 'antd';
import { ApplyItem, Certificate } from '@/common/type';
import { CERTIFICATE, ENCRYPTION } from '@/common/constant';
import { format } from '@/common/utils';

interface ApplicationDescriptionProps extends DescriptionsProps {
    item: ApplyItem;
}

interface CertificateDescriptionProps extends DescriptionsProps {
    item: Certificate;
}

export function ApplicationDescription({
    item,
    title,
    column = 2,
    ...restProps
}: ApplicationDescriptionProps) {
    const { created, done, origin, target, type } = item;
    return (
        <Descriptions title="申请信息" column={column} {...restProps}>
            <Descriptions.Item label="申请人">{origin}</Descriptions.Item>
            <Descriptions.Item label="受理人">{target}</Descriptions.Item>
            <Descriptions.Item label="申请时间">
                {/* @ts-ignore */}
                {format('created')(created)}
            </Descriptions.Item>
            <Descriptions.Item label="申请资源类型">
                {type === 'decrypt' ? '字段' : '证据'}
            </Descriptions.Item>
        </Descriptions>
    );
}

export function CertificateDescription({
    item,
    title,
    column = 2,
    ...restProps
}: CertificateDescriptionProps) {
    const { created, name, type, encryption } = item;
    return (
        <Descriptions title="证据信息" column={column} {...restProps}>
            <Descriptions.Item label="证据名称">{name}</Descriptions.Item>
            <Descriptions.Item label="证据类型">
                {CERTIFICATE.TYPE_TO_TEXT[type]}
            </Descriptions.Item>
            <Descriptions.Item label="加密类型">
                {ENCRYPTION.VALUE_TO_LABEL[encryption]}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
                {/* @ts-ignore */}
                {format('created')(created)}
            </Descriptions.Item>
        </Descriptions>
    );
}
