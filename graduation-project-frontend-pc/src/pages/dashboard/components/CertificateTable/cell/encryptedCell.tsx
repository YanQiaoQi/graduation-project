import { useState, useCallback, FC } from 'react';
import { Button, Tooltip } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Container from '@/components/Container';
import { Evidence } from '@/common/type';
import { format } from '@/common/utils';

interface EncryptedCellProps {
    disabled?: boolean;
    dataIndex: keyof Evidence;
    timeout?: number;
    children: string;
    getClear: () => Promise<any>;
}

const EncryptedCell: FC<EncryptedCellProps> = ({
    disabled = false,
    dataIndex,
    timeout = 3000,
    children,
    getClear,
}) => {
    const cipher = `${children?.substring?.(0, 5)}...`;

    const [content, setContent] = useState(cipher);

    const [isDecrypted, setIsDecrypted] = useState(false);

    const mergedOnClick = useCallback(() => {
        getClear().then((data) => {
            if (!data) return;
            setIsDecrypted(true);
            setContent(format(dataIndex)(data));
            setTimeout(() => {
                setIsDecrypted(false);
                setContent(cipher);
            }, timeout);
        });
    }, [getClear]);

    return (
        <td>
            <Container align="space-between">
                <Tooltip title={isDecrypted ? content : children}>
                    {content}
                </Tooltip>
                <Button
                    size="small"
                    type="link"
                    icon={
                        isDecrypted ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    disabled={isDecrypted || disabled}
                    onClick={mergedOnClick}
                />
            </Container>
        </td>
    );
};

export default EncryptedCell;
