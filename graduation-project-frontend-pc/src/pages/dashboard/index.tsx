import { useMemo, FC } from 'react';
import { Breadcrumb, Layout, Menu } from 'antd';
import Container from '@/components/Container';
import { navigateTo } from '@/common/utils';
import { PAGE_ITEMS } from '@/common/constant';
import { UserContext } from '@/common/contexts';
import { useUser } from '@/common/hooks';
import styles from './index.less';

const { Header, Content, Footer, Sider } = Layout;

const ConsolePage: FC = ({ children }) => {
    const [user] = useUser();

    const path = useMemo(
        () => location.pathname.substring(1).split(`/`),
        [location.pathname],
    );

    const BreadcrumbItems = useMemo(() => {
        let href = ``;
        return path.map((key, index) => {
            if (index === path.length - 1) {
                return {
                    title: key,
                };
            }
            href = `${href}/${key}`;
            return {
                title: key,
                href,
            };
        });
    }, [path]);

    const prefixCls = useMemo(() => 'console-index', []);

    return (
        <UserContext.Provider value={user}>
            <Layout className={styles[`${prefixCls}-container`]}>
                <Sider collapsible>
                    <div className={styles[`${prefixCls}-header-logo`]} />
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[path[path.length - 1]]}
                        defaultOpenKeys={PAGE_ITEMS.SIDER.map(({ key }) => key)}
                        onClick={({ keyPath }) => {
                            const path = keyPath.reverse().join(`/`);
                            navigateTo(`/dashboard/${path}`);
                        }}
                        items={PAGE_ITEMS.SIDER}
                    />
                </Sider>
                <Layout>
                    <Header className={styles[`${prefixCls}-header-container`]}>
                        <div className={styles[`${prefixCls}-header-text`]}>
                            {user?.email}
                        </div>
                    </Header>
                    <Content
                        className={styles[`${prefixCls}-content-container`]}
                    >
                        <Breadcrumb
                            className={
                                styles[`${prefixCls}-content-top-container`]
                            }
                            items={BreadcrumbItems}
                        />
                        <Layout
                            className={
                                styles[`${prefixCls}-content-bottom-container`]
                            }
                        >
                            <Content
                                className={
                                    styles[
                                        `${prefixCls}-content-bottom-content`
                                    ]
                                }
                            >
                                <Container
                                    className={
                                        styles[
                                            `${prefixCls}-content-bottom-content-container`
                                        ]
                                    }
                                >
                                    {children}
                                </Container>
                            </Content>
                        </Layout>
                    </Content>
                    <Footer className={styles[`${prefixCls}-footer-container`]}>
                        Graduation-Project ©2023 Created by QiYanQiao
                    </Footer>
                </Layout>
            </Layout>
        </UserContext.Provider>
    );
};

export default ConsolePage;
