import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { FcGoogle } from "react-icons/fc";
import styles from "./RegisterForm.module.css"; 
import { registerValidationSchema } from "./registerValidationSchema";

interface RegisterFormValues {
  email: string;
  fullName: string;
  password: string;
}

export default function RegisterForm() {
  const handleSubmit = (values: RegisterFormValues) => {
    console.log("Register attempt:", values);
  };

  return (
    <Formik
      initialValues={{
        email: "",
        fullName: "",
        password: "",
      }}
      validationSchema={registerValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, handleBlur, errors, touched }) => (
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
                Create your account
              </Typography>
              <Typography
                sx={{
                  color: "#757575",
                  fontSize: 14,
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                Join Dschang's Signal and start reporting issues in your community.
              </Typography>
            </div>

            <div className={styles.registerInputs}>
              <TextField
                label="Full Name"
                name="fullName"
                type="text"
                fullWidth
                variant="outlined"
                size="small"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.fullName && Boolean(errors.fullName)}
                helperText={touched.fullName && errors.fullName}
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
                }}
              />

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
              Register
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

            <div className={styles.loginText}>
              Already have an account?{" "}
              <span className={styles.loginLink}>Log in</span>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}