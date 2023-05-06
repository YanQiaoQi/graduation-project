import { Card } from 'antd';
import GuideSteps from './GuideSteps';
import GuideIntroduction from './GuideIntroduction';

function CertificatesGuidePage() {
    return (
        <Card title="操作引导">
            {/* <GuideSteps /> */}
            <GuideIntroduction />
        </Card>
    );
}

export default CertificatesGuidePage;
