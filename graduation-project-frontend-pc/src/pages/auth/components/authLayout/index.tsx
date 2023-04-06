import Container from '@/components/Container';
import { Layout } from 'antd';
import { ReactNode } from 'react';

import styles from './index.less';

interface AuthLayoutProps {
    title?: ReactNode;
    children: ReactNode;
    footerLeft?: 'login' | 'signup' | 'resetPwd';
    footerRight?: 'login' | 'signup' | 'resetPwd';
}

function AuthLayout({
    title,
    children,
    footerLeft,
    footerRight,
}: AuthLayoutProps) {
    const buttons = {
        login: (
            <span>
                已有账号，<a href="/auth/login">立即登录</a>
            </span>
        ),
        signup: (
            <span>
                未有账号，<a href="/auth/signup">立即注册</a>
            </span>
        ),
        resetPwd: (
            <span>
                <a href="/auth/resetPwd">忘记密码</a>
            </span>
        ),
    };
    return (
        <Layout className={styles['auth-layout']}>
            <div className={styles['auth-layout-container']}>
                {title && (
                    <div className={styles['auth-layout-header-container']}>
                        {title}
                    </div>
                )}
                <div className={styles['auth-layout-content-container']}>
                    {children}
                </div>
                {(footerLeft || footerRight) && (
                    <Container expand align="space-between">
                        {footerLeft && buttons[footerLeft]}
                        {footerRight && buttons[footerRight]}
                    </Container>
                )}
            </div>
        </Layout>
    );
}

export default AuthLayout;
