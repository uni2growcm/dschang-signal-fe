import * as Yup from 'yup';

export const getRegisterValidationSchema = (t: (key: string) => string) => Yup.object({
  fullName: Yup.string()
    .min(2, t('validation.fullname-min'))
    .max(50, t('validation.fullname-max'))
    .required(t('validation.fullname-required')),

  email: Yup.string()
    .email(t('validation.invalid-email'))
    .required(t('validation.email-required')),

  password: Yup.string()
    .min(6, t('validation.password-min'))
    .required(t('validation.password-required')),

  confirmPassword: Yup.string()
    .required(t('validation.confirm-password-required'))
    .oneOf([Yup.ref('password')], t('validation.password-match')),
});