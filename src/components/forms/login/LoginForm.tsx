import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router";
import { ResponseError } from "../../../api";
import { PATHS } from "../../../routes/PATHS";
import { authApi } from "../../../services";
import { LOCAL_STORAGE_KEYS } from "../../../utils/localStorage";
import SnackBar from "../../snackBar/SnackBar";
import FormTextField from "../shared/FormTextField";
import SuccessFade from "../shared/SuccessFade";
import styles from "./LoginForm.module.css";
import { loginValidationSchema } from "./schema";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm() {
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const response = await authApi.login({
        loginRequest: {
          email: values.email,
          password: values.password,
        },
      });
      return response;
    },
    onSuccess: (response) => {
      if (response.token) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, response.token);
        setSuccess(true);
        setErrorMessage("");
        setTimeout(() => {
          navigate(PATHS.INDEX);
        }, 2000);
      }
    },
    onError: (error: unknown) => {
      const err = error as ResponseError;
      const message =
        err.response?.status == 400
          ? "Invalid credentials"
          : "Login failed, please check your credentials.";
      if (!(error instanceof ResponseError)) {
        setErrorMessage("An unexpected error occurred. Please try again.");
        setIsError(true);
        return;
      }
      setErrorMessage(message);
      setIsError(true);
    },
    onSettled: () => {
      setTimeout(() => {
        setIsError(false);
      }, 1500);
    },
  });

  return (
    <Formik
      initialValues={{ email: "", password: "", remember: false }}
      validationSchema={loginValidationSchema}
      onSubmit={loginMutation.mutate}
    >
      {({ values, handleChange, handleBlur, errors, touched }) => (
        <Form>
          <div className={styles.loginForm}>
            <div className={styles.loginHeader}>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  letterSpacing: -0.5,
                }}
              >
                {t("login.welcomeBack")}
              </Typography>
              <Typography
                sx={{
                  color: "#757575",
                  fontSize: 14,
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                {t("login.description")}
              </Typography>
            </div>

            <SuccessFade
              show={success}
              message="Login successful"
              redirectText="Redirecting..."
            />

            <div
              className={styles.loginInputs}
              style={{
                opacity: success ? 0.5 : 1,
                pointerEvents: success ? "none" : "auto",
                transition: "all 0.4s ease",
              }}
            >
              <SuccessFade
                show={success}
                message={t("login.success")}
                redirectText={t("login.redirecting")}
              />

              <FormTextField
                label={t("login.email")}
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />

              <TextField
                label={t("login.password")}
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              {errorMessage && (
                <p className="text-error -mt-2 text-center">{errorMessage}</p>
              )}
            </div>

            <div className={styles.loginOptions}>
              <span className={styles.forgotPassword}>
                {t("login.forgotPassword")}
              </span>
              <FormControlLabel
                label={t("login.rememberMe")}
                labelPlacement="start"
                control={
                  <Switch
                    name="remember"
                    checked={values.remember}
                    onChange={handleChange}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#7c4dff",
                        "&:hover": {
                          backgroundColor: "rgba(124, 77, 255, 0.08)",
                        },
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#7c4dff",
                        },
                    }}
                  />
                }
                sx={{
                  m: 0,
                  gap: 1,
                  "& .MuiFormControlLabel-label": {
                    fontSize: 15,
                    color: "#555",
                    opacity: 0.8,
                  },
                }}
              />
            </div>

            <Button
              disabled={loginMutation.isPending || success}
              type="submit"
              fullWidth
              sx={{
                backgroundColor: "#7c4dff",
                color: "white",
                padding: "12px",
                borderRadius: "24px",
                fontWeight: 600,
                fontSize: "15px",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(124, 77, 255, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#6b3edb",
                  boxShadow: "0 6px 16px rgba(124, 77, 255, 0.4)",
                },
                marginTop: "8px",
              }}
            >
              {success
                ? t("login.redirecting")
                : loginMutation.isPending
                  ? t("login.loading")
                  : t("login.submit")}
            </Button>

            <Box sx={{ my: 2 }}>
              <Divider sx={{ fontSize: "14px", color: "#999" }}>
                {t("login.or")}
              </Divider>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              disabled={success}
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
                fontSize: "15px",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  border: "1px solid #bbb",
                },
              }}
            >
              <FcGoogle size={25} />
              <span className="text-inherit font-medium text-lg">
                {t("login.continueGoogle")}
              </span>
            </Button>

            <div className={styles.signupText}>
              {t("login.noAccount")}{" "}
              <button
                type="button"
                className={styles.signupLink}
                onClick={() => navigate(PATHS.REGISTER)}
                disabled={success}
              >
                {t("login.registerLink")}
              </button>
            </div>
          </div>

          <SnackBar
            open={isError}
            message={errorMessage}
            severity="error"
            position="bottom-right"
          />
        </Form>
      )}
    </Formik>
  );
}
