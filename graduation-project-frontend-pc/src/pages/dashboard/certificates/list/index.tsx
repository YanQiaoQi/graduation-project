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

    const allTableData = useRef<DataType[]>([]);

    const getData = useCallback(() => {
        request.get(URL.CERTIFICATE).then((res) => {
            allTableData.current = res.data;
            setTableData(res.data);
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
            <TableFilter data={allTableData.current} onChange={setTableData} />
            <Table data={tableData} getData={getData} onChange={setTableData} />
        </Card>
    );
};

export default CertificatesListPage;
