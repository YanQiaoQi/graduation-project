import { Evidence } from '@/common/type';
import EncryptedCell from './encryptedCell';
import EditableCell from './editableCell';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
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
    const { isEncrypted = false, index, dataIndex, getClear, record } = props;

    if (index !== 0 && isEncrypted) {
        return (
            <EncryptedCell
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
