import * as Yup from "yup";
import PropTypes from "prop-types";
import { Form, FormikProvider, useFormik } from "formik";
// material
import { Alert, Stack, InputAdornment } from "@mui/material";
import { Icon } from "@iconify/react";
// styling
import { StyledTextField, AuthButton } from "../AuthStyler";
import AuthService from "../../../services/auth.service";

ResetPasswordForm.propTypes = {
  onSent: PropTypes.func,
  onGetEmail: PropTypes.func,
};

export default function ResetPasswordForm({ onSent, onGetEmail }) {
  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // Simulate API call
        await AuthService.resetPassword(values.email);

        // Pass email back to parent component
        if (onGetEmail) {
          onGetEmail(values.email);
        }

        // Notify parent that form was submitted successfully
        if (onSent) {
          onSent();
        }
      } catch (error) {
        setErrors({ afterSubmit: error.message || "Something went wrong" });
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

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
            {...getFieldProps("email")}
            type="email"
            label="Email address"
            placeholder="example@nexc.co.uk"
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

          <AuthButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Reset Password
          </AuthButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
