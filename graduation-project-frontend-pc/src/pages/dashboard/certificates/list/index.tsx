import { Button, Card } from 'antd';
import useRequest from '@ahooksjs/use-request';
import Table from './table';
import { getEvidences } from '@/service/evidence';

const CertificatesListPage: React.FC = () => {
    const { data, loading, run } = useRequest(getEvidences);
    console.log(data);
    
    return (
        <Card
            title="证据列表"
            extra={
                <Button href="/dashboard/certificates/new">+ 新建证据</Button>
            }
        >
            <Table
                loading={loading}
                columnEncryption={data?.fieldEncryption}
                data={data?.evidences}
                getData={run}
            />
        </Card>
    );
};

export default CertificatesListPage;
