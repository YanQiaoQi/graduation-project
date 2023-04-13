import { Radio, Select } from 'antd';

type ItemType = {
    label: string;
    value: string;
    color: string;
};

interface EncryptionSelectProps {
    value: any;
    onChange: (e: any) => void;
    items: ItemType[];
}

function EncryptionSelect({ value, onChange, items }: EncryptionSelectProps) {
    if (items.length < 5) {
        return (
            <Radio.Group
                defaultValue={items[0].value}
                value={value}
                onChange={(e) => {
                    const value = e.target.value;
                    onChange?.(value);
                }}
            >
                {items.map(({ label, value, color }) => (
                    <Radio value={value}>
                        <span style={{ color }}>{label}</span>
                    </Radio>
                ))}
            </Radio.Group>
        );
    }
    return (
        <Select
            defaultValue={items[0].value}
            value={value}
            onChange={onChange}
            options={items}
        />
    );
}

export default EncryptionSelect;
