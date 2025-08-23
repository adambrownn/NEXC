import * as Yup from "yup";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useFormik, Form, FormikProvider } from "formik";
import eyeFill from "@iconify/icons-eva/eye-fill";
import eyeOffFill from "@iconify/icons-eva/eye-off-fill";
// material
import {
  Stack,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";

import AuthService from "../../../services/auth.service";
// custom styling
import { StyledTextField, AuthButton } from "../AuthStyler";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Name is too short")
      .max(50, "Name is too long")
      .required("Name is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password should be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        setSubmitting(true);
        const registerResp = await AuthService.register(
          values.name,
          values.email,
          values.password,
          "email"
        );
        if (registerResp.err) {
          setErrors({ afterSubmit: registerResp.err });
        } else {
          window.location.replace(`/dashboard`);
        }
        setSubmitting(false);
      } catch (err) {
        setErrors({ afterSubmit: err.message });
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {errors.afterSubmit && (
            <Alert
              severity="error"
              sx={{
                animation: 'fadeIn 0.5s',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(-10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              {errors.afterSubmit}
            </Alert>
          )}

          <StyledTextField
            fullWidth
            label="Full name"
            type="text"
            placeholder="John Doe"
            {...getFieldProps("name")}
            error={Boolean(touched.name && errors.name)}
            helperText={touched.name && errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="eva:person-outline" width={20} height={20} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            autoComplete="username"
            type="email"
            label="Email address"
            placeholder="example@nexc.co.uk"
            {...getFieldProps("email")}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="eva:email-outline" width={20} height={20} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            label="Password"
            {...getFieldProps("password")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="eva:lock-outline" width={20} height={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />

          <AuthButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Register
          </AuthButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
