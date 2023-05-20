import { useContext } from 'react';
import { Card, Space } from 'antd';
import useRequest from '@ahooksjs/use-request';
import { UserContext } from '@/common/contexts';
import Table from './table';
import { getAllEvidences } from '@/service/evidence';

function AllPage() {
    const { email } = useContext(UserContext);

    const { data: allEvidences, loading: loading0 } =
        useRequest(getAllEvidences);

    // const { data: authorizedCertificates, loading: loading1 } = useRequest(
    //     getAuthorizedApplication,
    // );

    // const isShow = useMemo(
    //     () =>
    //         authorizedCertificates?.data &&
    //         authorizedCertificates?.data?.length !== 0,
    //     [authorizedCertificates],
    // );

    return (
        <Space size={16} direction="vertical" style={{ width: '100%' }}>
            {/* {isShow && (
                <Card title="授权证据">
                    <AuthedTable
                        loading={loading1}
                        data={authorizedCertificates?.data}
                    />
                </Card>
            )} */}
            <Card title="证据库">
                <Table
                    user={email}
                    loading={loading0}
                    dataSource={allEvidences}
                />
            </Card>
        </Space>
    );
}

export default AllPage;
