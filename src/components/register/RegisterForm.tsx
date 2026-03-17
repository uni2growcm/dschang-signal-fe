import {
  Box,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import styles from "./RegisterForm.module.css";
import { registerValidationSchema } from "./registerValidationSchema";
import { PATHS } from "../../routes/PATHS";
import { useNavigate } from "react-router";
import { authApi } from "../../services";
import SuccessFade from "../forms/shared/SuccessFade";
import FormTextField from "../forms/shared/FormTextField";

interface RegisterFormValues {
  email: string;
  fullName: string;
  password: string;
}

export default function RegisterForm() {
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
    } catch (error: any) {
      console.error("Register error:", error);
      const message = error?.response?.data?.message || "Registration failed";
      alert(message);
    }
  };

  return (
    <Formik
      initialValues={{ email: "", fullName: "", password: "" }}
      validationSchema={registerValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
        <Form>
          <div className={styles.registerForm}>
            <div className={styles.registerHeader}>
              <Typography
                sx={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", letterSpacing: -0.5 }}
              >
                Create your account
              </Typography>
              <Typography
                sx={{ color: "#757575", fontSize: 14, lineHeight: 1.5, textAlign: "center" }}
              >
                Join Dschang's Signal and start reporting issues in your community.
              </Typography>
            </div>

            <SuccessFade
              show={isSuccess}
              message="Account created successfully"
              redirectText="Redirecting to login..."
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
                label="Full Name"
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.fullName && Boolean(errors.fullName)}
                helperText={touched.fullName && errors.fullName}
              />
              <FormTextField
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              <FormTextField
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
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
              {isSuccess ? "Redirecting..." : isSubmitting ? "Registering..." : "Register"}
            </Button>

            <Box sx={{ my: 2 }}>
              <Divider>OR</Divider>
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
              Continue with Google
            </Button>

            <div className={styles.loginText}>
              Already have an account?{" "}
              <button
                type="button"
                className={styles.loginLink}
                onClick={() => navigate(PATHS.LOGIN)}
                disabled={isSuccess}
              >
                Log in
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}