import { Form, FormItemProps as AntdFormItemProps } from 'antd';

export interface FormItemProps extends AntdFormItemProps {
    requiredMessage?: string;
}

export function FormItem({
    required,
    requiredMessage,
    label,
    name,
    rules: customRules,
    extra,
    ...restProps
}: FormItemProps) {
    let rules = [];
    if (required || requiredMessage) {
        const requiredRule = {
            required: true,
            message: requiredMessage ?? `请输入您的${label}`,
        };
        rules.push(requiredRule);
    }
    if (customRules) {
        rules.push(...customRules);
    }
    return (
        <Form.Item
            name={name}
            label={label}
            rules={rules}
            extra={
                extra && <div style={{ margin: '12px 0 -12px 0' }}>{extra}</div>
            }
            {...restProps}
        />
    );
}

export default FormItem;
