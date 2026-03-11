import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { FcGoogle } from "react-icons/fc";
import { loginValidationSchema } from "./schema";
import styles from "./LoginForm.module.css";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm() {
  const handleSubmit = (values: LoginFormValues) => {
    console.log("Login attempt:", values);
  };

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
        remember: false,
      }}
      validationSchema={loginValidationSchema}
      onSubmit={handleSubmit}
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
                Welcome back
              </Typography>
              <Typography
                sx={{
                  color: "#757575",
                  fontSize: 14,
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                Report and track signals in your community with Dschang's
                Signal.
              </Typography>
            </div>

            <div className={styles.loginInputs}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                variant="outlined"
                size="small"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "&.Mui-focused fieldset": {
                      borderColor: "#7c4dff",
                    },
                    "&.Mui-focused": {
                      "& fieldset": {
                        borderColor: "#7c4dff",
                      },
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    "&::placeholder": {
                      opacity: 1,
                    },
                  },
                }}
              />

              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                variant="outlined"
                size="small"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "&.Mui-focused fieldset": {
                      borderColor: "#7c4dff",
                    },
                    "&.Mui-focused": {
                      "& fieldset": {
                        borderColor: "#7c4dff",
                      },
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    "&::placeholder": {
                      opacity: 1,
                    },
                  },
                }}
              />
            </div>

            <div className={styles.loginOptions}>
              <span className={styles.forgotPassword}>Forgot password?</span>
              <FormControlLabel
                label="Remember sign in details"
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
                "&:hover": {
                  backgroundColor: "#6b3edb",
                  boxShadow: "0 6px 16px rgba(124, 77, 255, 0.4)",
                },
                marginTop: "8px",
              }}
            >
              Log in
            </Button>

            <Box sx={{ my: 2 }}>
              <Divider sx={{ fontSize: "14px", color: "#999" }}>OR</Divider>
            </Box>

            <Button
              variant="outlined"
              fullWidth
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
              <span className="text-inherit font-medium text-lg">Continue with Google</span>
            </Button>

            <div className={styles.signupText}>
              Don't have an account?{" "}
              <span className={styles.signupLink}>Sign up</span>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
