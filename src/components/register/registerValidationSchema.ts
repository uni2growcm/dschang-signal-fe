import * as Yup from "yup";

export const registerValidationSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "register.fullNameMin")
    .max(50, "register.fullNameMax")
    .required("register.fullNameRequired"),

  email: Yup.string()
    .email("register.invalidEmail")
    .required("register.emailRequired"),

  password: Yup.string()
    .min(6, "register.passwordMin")
    .required("register.passwordRequired"),
});
