import * as Yup from 'yup';

export const getGeneralValidationSchema = (t: (key: string) => string) => Yup.object({
  email: Yup.string()
    .email(t('settings.validation.invalid-email'))
    .required(t('settings.validation.email-required')),

  fullName: Yup.string()
    .min(2, t('settings.validation.fullname-min'))
    .max(50, t('settings.validation.fullname-max'))
    .required(t('settings.validation.fullname-required')),
});

export const getPasswordValidationSchema = (t: (key: string) => string) => Yup.object({
  currentPassword: Yup.string()
    .min(6, t('settings.validation.password-min'))
    .required(t('settings.validation.current-password-required')),

  newPassword: Yup.string()
    .min(6, t('settings.validation.password-min'))
    .notOneOf(
      [Yup.ref('currentPassword')],
      t('settings.validation.password-different')
    )
    .required(t('settings.validation.new-password-required')),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], t('settings.validation.password-match'))
    .required(t('settings.validation.confirm-password-required')),
});