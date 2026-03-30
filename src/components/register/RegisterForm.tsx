import { Box, Button, Divider, Typography } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PATHS } from "../../routes/PATHS";
import { authApi } from "../../services";
import { LOCAL_STORAGE_KEYS } from "../../utils/localStorage";
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
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      let message = t("register.error");

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      setErrorMessage(message);
      setIsError(true);

      setTimeout(() => setIsError(false), 3000);
    }
  };

  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idToken }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || t("register.googleLoginFailed"));
      }

      return response.json();
    },

    onSuccess: (response) => {
      if (response?.token) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, response.token);

        setIsSuccess(true);
        setErrorMessage("");

        setTimeout(() => {
          navigate(PATHS.INDEX);
        }, 2000);
      }
    },

    onError: (error: unknown) => {
      let message = t("register.googleLoginFailed");

      if (error instanceof Error) {
        message = error.message;
      }

      setErrorMessage(message);
      setIsError(true);

      setTimeout(() => setIsError(false), 3000);
    },
  });

  const handleGoogleLogin = (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setErrorMessage(t("register.googleLoginFailed"));
      setIsError(true);

      setTimeout(() => setIsError(false), 3000);
      return;
    }

    googleLoginMutation.mutate(credentialResponse.credential);
  };

  return (
    <Formik
      initialValues={{
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
      }}
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
                }}
              >
                {t("register.title")}
              </Typography>

              <Typography
                sx={{
                  color: "#757575",
                  fontSize: 14,
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
                label={t("register.confirmPassword")}
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.confirmPassword && Boolean(errors.confirmPassword)
                }
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
                textTransform: "none",
                mt: 1,
              }}
            >
              {isSuccess
                ? t("register.redirecting")
                : isSubmitting
                  ? t("register.loading")
                  : t("register.submit")}
            </Button>

            <Box sx={{ my: 2 }}>
              <Divider>{t("register.or")}</Divider>
            </Box>

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                setErrorMessage(t("register.googleLoginFailed"));
                setIsError(true);
                setTimeout(() => setIsError(false), 3000);
              }}
              theme="outline"
              shape="pill"
              width="100%"
              text="continue_with"
              locale={t("register.googleLocale")}
            />

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
