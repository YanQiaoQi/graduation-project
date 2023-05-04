import { useMemo, useEffect, FC } from 'react';
import { Breadcrumb, Layout, Menu } from 'antd';
import Container from '@/components/Container';
import { navigateTo } from '@/common/utils';
import { PAGE_ITEMS, URL } from '@/common/constant';
import request from '@/common/request';
import styles from './index.less';

const { Header, Content, Footer, Sider } = Layout;

const ConsolePage: FC = ({ children }) => {
    const path = useMemo(() => {
        const pathArr = location.pathname.split(`/`);
        pathArr.shift();
        return pathArr;
    }, [location.pathname]);

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

    const SiderSelectedKey = useMemo(() => path[path.length - 1], [path]);

    const prefixCls = useMemo(() => 'console-index', []);

    useEffect(() => {
        request.get(`${URL.USER}/isAuthorized`);
    }, []);

    return (
        <Layout className={styles[`${prefixCls}-container`]}>
            <Header className={styles[`${prefixCls}-header-container`]}>
                <div className="logo" />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    // defaultSelectedKeys={[`2`]}
                    // items={PAGE_ITEMS.NAV}
                    items={[]}
                />
            </Header>
            <Content className={styles[`${prefixCls}-content-container`]}>
                <Breadcrumb
                    className={styles[`${prefixCls}-content-top-container`]}
                    items={BreadcrumbItems}
                />
                <Layout
                    className={styles[`${prefixCls}-content-bottom-container`]}
                >
                    <Sider style={{ background: `#ffffff` }} width={200}>
                        <Menu
                            mode="inline"
                            selectedKeys={[SiderSelectedKey]}
                            defaultOpenKeys={[`personal`, `certificates`]}
                            style={{ height: `100%` }}
                            onClick={({ keyPath }) => {
                                const path = keyPath.reverse().join(`/`);
                                navigateTo(`/dashboard/${path}`);
                            }}
                            items={PAGE_ITEMS.SIDER}
                        />
                    </Sider>
                    <Content
                        className={
                            styles[`${prefixCls}-content-bottom-content`]
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
    );
};

export default ConsolePage;
