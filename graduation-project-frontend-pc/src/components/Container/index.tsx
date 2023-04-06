import classNames from 'classnames';
import { ReactNode } from 'react';
import './index.less';

interface ContainerProps {
    children?: ReactNode;
    expand?: boolean;
    flex?: boolean;
    direction?: 'row' | 'column';
    align?: 'space-between' | 'start';
}

function Container({
    expand = false,
    flex = false,
    children,
    direction,
    align,
}: ContainerProps) {
    let isFlex = flex;
    let flexDirection = direction;
    let justifyContent = align;
    if (direction || align) {
        isFlex = true;
        flexDirection = direction ?? 'row';
        justifyContent = align ?? 'start';
    }
    const className = classNames({
        'container-expand': expand,
        'container-flex': isFlex,
        [`container-flex-direction-${flexDirection}`]: isFlex,
        [`container-flex-justify-content-${justifyContent}`]: isFlex,
    });
    return <div className={className}>{children}</div>;
}

export default Container;
