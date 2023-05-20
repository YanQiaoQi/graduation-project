import { Evidence } from '@/common/type';
import EncryptedCell from './encryptedCell';
import EditableCell from './editableCell';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    disabled: boolean;
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

const Cell: React.FC<EditableCellProps> = (props) => {
    const {
        isEncrypted = false,
        index,
        dataIndex,
        getClear,
        record,
        showColumnEncryption,
        disabled,
    } = props;

    if ((index !== 0 || !showColumnEncryption) && isEncrypted) {
        return (
            <EncryptedCell
                disabled={disabled}
                timeout={5000}
                dataIndex={dataIndex}
                getClear={getClear}
            >
                {record[dataIndex] as string}
            </EncryptedCell>
        );
    } else {
        return <EditableCell {...props} />;
    }
};

export default Cell;
