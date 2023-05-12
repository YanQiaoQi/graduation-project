import FormItem from '@/components/FormItem';

import { ENCRYPTION_ITEMS_MAP } from '@/common/constant';

interface EditableCellProps<T = any> extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    index: number;
    record: T;
    editable: boolean;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    index,
    dataIndex,
    title,
    record,
    children,
    editable,
    ...restProps
}) => {
    const encryptionStyle = index === 0 ? { backgroundColor: '#fafafa' } : {};
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
