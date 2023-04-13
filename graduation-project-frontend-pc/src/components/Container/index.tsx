import classNames from 'classnames';
import { CSSProperties, ReactNode } from 'react';
import './index.less';

interface ContainerProps {
    className?: string;
    children?: ReactNode;
    expand?: boolean;
    style?: CSSProperties;
    flex?: boolean;
    direction?: 'row' | 'column';
    align?: 'space-between' | 'start' | 'center';
}

function Container({
    expand = false,
    flex = false,
    children,
    direction,
    align,
    style,
    className: customClassName,
}: ContainerProps) {
    let isFlex = flex;
    let flexDirection = direction;
    let justifyContent = align;
    if (direction || align) {
        isFlex = true;
        flexDirection = direction ?? 'row';
        justifyContent = align ?? 'start';
    }
    const className = classNames(customClassName, {
        'container-expand': expand,
        'container-flex': isFlex,
        [`container-flex-direction-${flexDirection}`]: isFlex,
        [`container-flex-justify-content-${justifyContent}`]: isFlex,
    });
    return (
        <div className={className} style={style}>
            {children}
        </div>
    );
}

export default Container;
