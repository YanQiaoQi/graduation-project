import { Steps } from 'antd';
import {
    PlayCircleOutlined,
    UserOutlined,
    TableOutlined,
} from '@ant-design/icons';
import { useMemo, useCallback, useState, createElement } from 'react';
import { navigateTo } from '@/common/utils';

function GuideSteps() {
    const [current, setcurrent] = useState(-1);

    const stepsItems = useMemo(
        () => [
            // {
            //     title: '用户实名',
            //     icon: createElement(UserOutlined),
            // },
            {
                title: '新建确权',
                icon: createElement(PlayCircleOutlined),
            },
            {
                title: '数据列表',
                icon: createElement(TableOutlined),
            },
        ],
        [],
    );

    const currentToHref = useMemo(
        () => [
            '/',
            '/dashboard/certificates/new',
            '/dashboard/certificates/list',
        ],

        [],
    );

    const onStepChange = useCallback((current) => {
        setcurrent(current);
        navigateTo(currentToHref[current]);
    }, []);

    return (
        <Steps
            current={current}
            items={stepsItems}
            onChange={onStepChange}
            style={{ margin: "24px 0 48px 0" }}
        />
    );
}

export default GuideSteps;
