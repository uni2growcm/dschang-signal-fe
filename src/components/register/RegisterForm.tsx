import { Box, Button, Divider, Typography } from "@mui/material";
import axios from "axios";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router";
import { PATHS } from "../../routes/PATHS";
import { authApi } from "../../services";
import FormTextField from "../forms/shared/FormTextField";
import SuccessFade from "../forms/shared/SuccessFade";
import styles from "./RegisterForm.module.css";
import { getRegisterValidationSchema } from "./registerValidationSchema";

interface RegisterFormValues {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const { t } = useTranslation();
  const registerValidationSchema = getRegisterValidationSchema(t);
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      await authApi.register({
        registerRequest: {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        },
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 2000);
    } catch (error: unknown) {
      console.error("Register error:", error);

      let message = t("register.error");

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      alert(message);
    }
  };

  return (
    <Formik
      initialValues={{ email: "", fullName: "", password: "", confirmPassword: ""}}
      validationSchema={registerValidationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        handleChange,
        handleBlur,
        errors,
        touched,
        isSubmitting,
      }) => (
        <Form>
          <div className={styles.registerForm}>
            <div className={styles.registerHeader}>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  letterSpacing: -0.5,
                }}
              >
                {t("register.title")}
              </Typography>

              <Typography
                sx={{
                  color: "#757575",
                  fontSize: 14,
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                {t("register.description")}
              </Typography>
            </div>

            <SuccessFade
              show={isSuccess}
              message={t("register.success")}
              redirectText={t("register.redirect")}
            />

            <div
              className={styles.registerInputs}
              style={{
                opacity: isSuccess ? 0.5 : 1,
                pointerEvents: isSuccess ? "none" : "auto",
                transition: "all 0.4s ease",
              }}
            >
              <FormTextField
                label={t("register.fullName")}
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.fullName && Boolean(errors.fullName)}
                helperText={touched.fullName && errors.fullName}
              />

              <FormTextField
                label={t("register.email")}
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />

              <FormTextField
                label={t("register.password")}
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />

              <FormTextField
                label={t('register.confirmPassword')}
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting || isSuccess}
              sx={{
                backgroundColor: "#7c4dff",
                color: "white",
                padding: "12px",
                borderRadius: "24px",
                fontWeight: 600,
                fontSize: "15px",
                textTransform: "none",
                marginTop: "8px",
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "#6b3edb" },
              }}
            >
              {isSuccess
                ? t("register.redirecting")
                : isSubmitting
                  ? t("register.loading")
                  : t("register.submit")}
            </Button>

            <Box sx={{ my: 2 }}>
              <Divider sx={{ fontSize: "14px", color: "#999" }}>
                {t("register.or")}
              </Divider>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              disabled={isSuccess}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px",
                borderRadius: "24px",
                border: "1px solid #ddd",
                color: "#333",
                textTransform: "none",
              }}
            >
              <FcGoogle size={25} />
              <span className="text-inherit font-medium text-lg">
                {t("register.continueGoogle")}
              </span>
            </Button>

            <div className={styles.loginText}>
              {t("register.haveAccount")}{" "}
              <button
                type="button"
                className={styles.loginLink}
                onClick={() => navigate(PATHS.LOGIN)}
                disabled={isSuccess}
              >
                {t("register.loginLink")}
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
