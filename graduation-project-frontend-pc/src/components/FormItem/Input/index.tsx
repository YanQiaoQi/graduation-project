import { Input } from 'antd';
import { FormItem, FormItemProps } from '../template';
import { FormItemEmail } from './Email';
import { FormItemPwd } from './Password';
import { FormItemCaptcha } from './Captcha';
import styles from '../index.less';

export function FormItemInput(props: FormItemProps) {
    return (
        <FormItem {...props}>
            <Input className={styles['form-item-input']} autoComplete="off" />
        </FormItem>
    );
}

FormItemInput.Email = FormItemEmail;
FormItemInput.Password = FormItemPwd;
FormItemInput.Captcha = FormItemCaptcha;
