import { Typography } from 'antd';
import { ReactNode, useMemo } from 'react';

interface IntroductionItemProps {
    title: string;
    content: ReactNode;
}

function IntroductionItem({ title, content }: IntroductionItemProps) {
    return (
        <>
            <Typography.Title level={5}>{title}</Typography.Title>
            <Typography.Paragraph>{content}</Typography.Paragraph>
        </>
    );
}

function GuideIntroduction() {
    const items = useMemo(
        () => [
            {
                title: '功能介绍',
                content:
                    '对文档、图片、音频、视频、网页等进行确权，证明提交确权的文件自提交公证处保管之时起未经篡改。',
            },
            {
                title: '操作说明',
                content: (
                    <span>
                        ①　点击【新建确权】。
                        <br />
                        ②　证据名称可自定义，添加备注可以进行标签化管理。
                        <br />
                        ③　如确权文档、图片、音频、视频，可在本地电脑【选择文件】，上传并确认提交，确权完成。
                        <br />
                        ④　如确权网页，可在【URL地址】输入网页链接地址（如https：//www.jcyunzheng.com）并确认提交，确权完成。
                        <br />
                    </span>
                ),
            },
            {
                title: '查看取证记录',
                content:
                    '点击【确权通道】，可查看电子数据保管证书、申请公证、证据下载。',
            },
        ],

        [],
    );
    return (
        <Typography>
            {items.map((item) => (
                <IntroductionItem {...item} />
            ))}
        </Typography>
    );
}

export default GuideIntroduction;
