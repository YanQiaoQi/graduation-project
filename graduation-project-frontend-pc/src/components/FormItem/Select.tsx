import { Radio, Select } from 'antd';
import { FormItem, FormItemProps } from './template';

type ItemType = {
    label: string;
    value: string;
};

interface FormItemSelectProps extends FormItemProps {
    name: string;
    items: ItemType[];
}

export function FormItemSelect({
    name,
    items,
    ...restProps
}: FormItemSelectProps) {
    let children = <></>;
    if (items.length < 5) {
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
