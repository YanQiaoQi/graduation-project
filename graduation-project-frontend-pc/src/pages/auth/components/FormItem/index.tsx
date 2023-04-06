import { Form, FormItemProps } from 'antd';
import { FormItemEmail } from './Email';
import { FormItemCaptcha } from './Captcha';
import { FormItemPwd } from './Password';
import { FormItemSubmit } from './Submit';

function FormItem(props: FormItemProps) {
    return <Form.Item {...props} />;
}

FormItem.Email = FormItemEmail;
FormItem.Captcha = FormItemCaptcha;
FormItem.Password = FormItemPwd;
FormItem.Submit = FormItemSubmit;

export default FormItem;
