import { useContext } from 'react';
import { Card } from 'antd';
import request from '@/common/request';
import { URL } from '@/common/constant';
import { UserContext } from '@/common/contexts';
import Table from './Table';
import useRequest from '@ahooksjs/use-request';

interface AllPageProps {}

function AllPage({}: AllPageProps) {
    const { email } = useContext(UserContext);

    const { data, loading, error } = useRequest<any>(async () => {
        return request.get(`${URL.CERTIFICATE}/all`);
    });

    return (
        <Card title="证据库">
            <Table
                user={email ?? ''}
                loading={loading}
                data={data?.data ?? []}
            />
        </Card>
    );
}

export default AllPage;
