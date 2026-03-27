import * as Yup from "yup";

export const getLoginValidationSchema = (t: (key: string) => string) => {
  return Yup.object({
    email: Yup.string()
      .email(t('login.invalid-email'))
      .required(t('login.email-required')),
    password: Yup.string()
      .min(6, t('login.password-min'))
      .required(t('login.password-required')),
  });
};