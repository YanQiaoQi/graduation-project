import { FormItem as CustomFormItem, FormItemProps } from './template';
import { FormItemSubmit } from './Submit';
import { FormItemUpload } from './Upload';
import { FormItemSelect } from './Select';
import { FormItemInput } from './Input/index';

function FormItem(props: FormItemProps) {
    return <CustomFormItem {...props} />;
}

FormItem.Submit = FormItemSubmit;
FormItem.Upload = FormItemUpload;
FormItem.Select = FormItemSelect;
FormItem.Input = FormItemInput;

export default FormItem;
