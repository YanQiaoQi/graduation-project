import { Radio, Select } from 'antd';
import { FormItem, FormItemProps } from './template';

type ItemType = {
    label: string;
    value: string | number;
};

interface FormItemSelectProps extends FormItemProps {
    type?: 'select' | 'radio';
    name: string;
    items: ItemType[];
}

export function FormItemSelect({
    type = 'select',
    name,
    items = [],
    ...restProps
}: FormItemSelectProps) {
    let children = <></>;
    if (items.length < 5 && type === 'radio') {
        children = (
            <Radio.Group>
                {items.map(({ label, value }) => (
                    <Radio key={value} value={value}>
                        <span>{label}</span>
                    </Radio>
                ))}
            </Radio.Group>
        );
    } else {
        children = <Select options={items} />;
    }
    return (
        <FormItem name={name} {...restProps}>
            {children}
        </FormItem>
    );
}
