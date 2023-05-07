import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Card } from 'antd';
import { URL, CertificateType } from '@/common/constant';
import request from '@/common/request';
import TableFilter from './CertificateFilter';
import Table from './CertificateTable';

export type Encryption = 'AES';

export interface DataType {
    key: React.Key;
    name: string;
    type: CertificateType;
    encryption: Encryption;
    description: string;
    created: number;
    size: number;
    extension: string;
}

const CertificatesListPage: React.FC = () => {
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [columnEncryption, setColumnEncryption] = useState({
        name: 'clear',
        type: 'clear',
        encryption: 'clear',
        created: 'clear',
        size: 'clear',
        description: 'clear',
        extension: 'clear',
    });

    const allTableData = useRef<DataType[]>([]);

    const getData = useCallback(() => {
        request.get(URL.CERTIFICATE).then((res) => {
            allTableData.current = res.data.certificates;
            setTableData(res.data.certificates);
            setColumnEncryption(res.data.columnEncryption);
        });
    }, []);

    useEffect(() => {
        getData();
    }, []);

    return (
        <Card
            title="证据列表"
            extra={
                <Button href="/dashboard/certificates/new">+ 新建证据</Button>
            }
        >
            <TableFilter data={allTableData.current} setData={setTableData} />
            <Table
                columnEncryption={columnEncryption}
                setColumnEncryption={setColumnEncryption}
                data={tableData}
                setData={setTableData}
                getData={getData}
            />
        </Card>
    );
};

export default CertificatesListPage;
