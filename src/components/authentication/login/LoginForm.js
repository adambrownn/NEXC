import * as Yup from "yup";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useFormik, Form, FormikProvider } from "formik";
import { Icon } from "@iconify/react";
import eyeFill from "@iconify/icons-eva/eye-fill";
import eyeOffFill from "@iconify/icons-eva/eye-off-fill";
// material
import {
  Link,
  Stack,
  Alert,
  Checkbox,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Typography,
} from "@mui/material";

// routes
import { PATH_AUTH } from "../../../routes/paths";
import AuthService from "../../../services/auth.service";
// custom styling
import { StyledTextField, AuthButton } from "../AuthStyler";

// Helper function to detect identifier type
const isEmail = (value) => {
  return value && value.includes('@');
};

// Helper function for UK phone validation
const isValidPhone = (phone) => {
  // Basic phone validation - customize as needed
  return /^(\+|)[0-9]{7,15}$/.test(phone);
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  // Updated schema to accept either email or phone
  const LoginSchema = Yup.object().shape({
    identifier: Yup.string()
      .required("Email or phone number is required")
      .test('is-valid-identifier', 'Enter a valid email or phone number', value => {
        if (isEmail(value)) {
          // Email validation
          const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
          return emailRegex.test(value);
        } else {
          // Phone validation
          return isValidPhone(value);
        }
      }),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
      remember: true,
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        let authResponse;

        // Determine if identifier is email or phone
        if (isEmail(values.identifier)) {
          // Email login
          authResponse = await AuthService.loginWithEmail(
            values.identifier,
            values.password
          );
        } else {
          // Phone login
          authResponse = await AuthService.loginWithPhone(
            values.identifier,
            values.password
          );
        }

        // Handle response
        if (authResponse.err) {
          setErrors({ afterSubmit: authResponse.err });
        } else if (
          !["admin", "superadmin"].includes(authResponse?.user?.accountType)
        ) {
          setErrors({
            afterSubmit: "We know you are spying. You might not be an Admin!",
          });
          await AuthService.logout();
        } else {
          window.location.replace(`/dashboard`);
        }
      } catch (err) {
        setErrors({ afterSubmit: "Something went wrong" });
      }
    },
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {errors.afterSubmit && (
            <Alert
              severity="error"
              sx={{
                '& .MuiAlert-icon': {
                  color: 'error.main'
                },
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
            autoComplete="username"
            type="text" // Changed from "email" to "text" to support both formats
            label="Email or Phone number"
            placeholder="example@nexc.co.uk or +447123456789"
            {...getFieldProps("identifier")}
            error={Boolean(touched.identifier && errors.identifier)}
            helperText={touched.identifier && errors.identifier}
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
                    onClick={handleShowPassword}
                    edge="end"
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
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ my: 2 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                {...getFieldProps("remember")}
                checked={values.remember}
                sx={{
                  '&.Mui-checked': {
                    color: 'primary.main',
                  }
                }}
              />
            }
            label="Remember me"
          />

          <Link
            component={RouterLink}
            variant="subtitle2"
            to={PATH_AUTH.resetPassword}
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'primary.dark',
                textDecoration: 'underline',
              }
            }}
          >
            Forgot password?
          </Link>
        </Stack>

        <AuthButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{
            mt: 1,
            boxShadow: (theme) => theme.customShadows.z8,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: (theme) => theme.customShadows.z16,
            },
          }}
        >
          Login
        </AuthButton>

        <Typography
          variant="caption"
          align="center"
          sx={{
            display: 'block',
            color: 'text.secondary',
            mt: 2
          }}
        >
          Enter the same credentials you used during registration
        </Typography>
      </Form>
    </FormikProvider>
  );
}
