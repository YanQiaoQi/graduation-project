import FormItem from '@/components/FormItem';
import { ENCRYPTION_ITEMS_MAP } from '@/common/constant';
import { Evidence } from '@/common/type';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    showColumnEncryption?: boolean;
    editing: boolean;
    dataIndex: keyof Evidence;
    title: any;
    index: number;
    record: Evidence;
    editable: boolean;
    isEncrypted?: boolean;
    children: string;
    getClear: () => Promise<any>;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    isEncrypted = false,
    index,
    dataIndex,
    title,
    record,
    children,
    editable,
    getClear,
    showColumnEncryption,
    ...restProps
}) => {
    const encryptionStyle =
        index === 0 && showColumnEncryption
            ? { backgroundColor: '#fafafa' }
            : {};

    return (
        <td {...restProps} style={encryptionStyle}>
            {editing && editable ? (
                <FormItem.Select
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                    items={ENCRYPTION_ITEMS_MAP.text}
                />
            ) : (
                children
            )}
        </td>
    );
};

export default EditableCell;
