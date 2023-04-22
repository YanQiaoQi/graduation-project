import { message, Upload as AntdUpload, UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { FormItem, FormItemProps } from './template';
import { CertificateType, CERTIFICATE } from '@/common/constant';
import { UploadChangeParam } from 'antd/es/upload';

interface MyUploadProps extends FormItemProps {
    type?: CertificateType;
    maxCount?: number;
}

export function FormItemUpload({
    type,
    maxCount = 5,
    ...restProps
}: MyUploadProps) {
    message.config({
        maxCount: 5,
    });
    const uploadProps: UploadProps = {
        name: 'file',
        maxCount,
        multiple: true,
        onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
                message.success(
                    `${info.file.name} file uploaded successfully.`,
                );
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        beforeUpload(file) {
            const { size, name } = file;
            if (!type) {
                message.error(`未指定存证类型`);
                return AntdUpload.LIST_IGNORE;
            }
            const maxSize = CERTIFICATE.TYPE_TO_MAX_SIZE[type];
            if (size === 0) {
                message.error(`${name}内存为0KB`);
                return AntdUpload.LIST_IGNORE;
            }
            if (size > maxSize) {
                message.error(`${name}文件内存过大`);
                return AntdUpload.LIST_IGNORE;
            }
            if (name.length > 255) {
                message.error(`${name}文件名过长`);
                return AntdUpload.LIST_IGNORE;
            }
            if (/[\\\\/:*?\"<>|]/.test(name)) {
                message.error(`${name}文件名包含 \ / : * ? " < > |`);
                return AntdUpload.LIST_IGNORE;
            }
            if (
                /[`~!@#$%^&*+=<>?:"{}|,\/;'\\[\]·~！@#￥%……&*（）——+={}|《》？：“”【】、；‘'，。、]/.test(
                    name,
                )
            ) {
                message.error(`${name}文件名包含特殊字符`);
                return AntdUpload.LIST_IGNORE;
            }
            return true;
        },
    };

    if (type) {
        uploadProps.accept = CERTIFICATE.TYPE_TO_ACCEPT[type];
    }

    const normFile = (e: UploadChangeParam) =>
        e?.fileList.map((file) => file?.originFileObj);

    const extra = (
        <span>
            1. 属同权利人的同类型文件可批量上传,每次最多同时上传5个文件 <br />
            2. 单个视频、音频文件不可超过200M <br />
            3. 单个文档、图片文件不可超过50M <br />
            4. 不可上传0kb文件 <br />
            5. 文件名不能包含以下英文字符： \ / : * ? " &lt; &gt; | <br />
            6. 文件名不能包含特殊符号 <br />
            7. 文件名最大长度为255 <br />
        </span>
    );

    return (
        <FormItem
            {...restProps}
            valuePropName="file"
            getValueFromEvent={normFile}
            extra={extra}
        >
            <AntdUpload.Dragger {...uploadProps} key={type}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                    Click or drag file to this area to upload
                </p>
            </AntdUpload.Dragger>
        </FormItem>
    );
}
