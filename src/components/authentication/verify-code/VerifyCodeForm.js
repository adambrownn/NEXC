import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, FormikProvider, useFormik } from "formik";
// material
import { OutlinedInput, FormHelperText, Stack, Alert, Typography, Box } from "@mui/material";
import { Icon } from "@iconify/react";
// routes
import { PATH_DASHBOARD } from "../../../routes/paths";
// styling
import { AuthButton } from "../AuthStyler";
// services
import AuthService from "../../../services/auth.service";

// Helper to restrict to single digit
function maxLength(object) {
  if (object.target.value.length > object.target.maxLength) {
    return (object.target.value = object.target.value.slice(
      0,
      object.target.maxLength
    ));
  }
}

// Auto-focus next field
const handleChangeWithNextField = (event, getFieldProps, handleChange, fieldIndex) => {
  const { maxLength, value } = event.target;

  const fieldIntIndex = Number(fieldIndex);
  const nextField = document.querySelector(
    `input[name=code${fieldIntIndex + 1}]`
  );
  const prevField = document.querySelector(
    `input[name=code${fieldIntIndex - 1}]`
  );

  if (value.length >= maxLength) {
    if (nextField !== null) {
      nextField.focus();
    }
  }

  if (value.length === 0) {
    if (prevField !== null) {
      prevField.focus();
    }
  }

  handleChange(event);
};

export default function VerifyCodeForm({
  verificationType = "email", // "email" or "phone"
  identifier = "", // email address or phone number
  onSuccess,
  onResendCode
}) {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required("Code is required"),
    code2: Yup.string().required("Code is required"),
    code3: Yup.string().required("Code is required"),
    code4: Yup.string().required("Code is required"),
    code5: Yup.string().required("Code is required"),
    code6: Yup.string().required("Code is required"),
  });

  const formik = useFormik({
    initialValues: {
      code1: "",
      code2: "",
      code3: "",
      code4: "",
      code5: "",
      code6: "",
    },
    validationSchema: VerifyCodeSchema,
    onSubmit: async (values) => {
      try {
        setErrorMsg("");
        // Combine all code digits
        const verificationCode = Object.values(values).join("");

        // Choose the right API endpoint based on verification type
        let verificationResponse;
        if (verificationType === "email") {
          verificationResponse = await AuthService.verifyCodeEmail(identifier, verificationCode);
        } else {
          verificationResponse = await AuthService.verifyCodePhone(identifier, verificationCode);
        }

        // Handle API response
        if (verificationResponse.err || verificationResponse.error) {
          setErrorMsg(verificationResponse.err || verificationResponse.error);
        } else if (verificationResponse.success || verificationResponse.verified) {
          // Call success callback or navigate
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(PATH_DASHBOARD.root);
          }
        } else {
          setErrorMsg("Verification failed. Please try again.");
        }
      } catch (error) {
        setErrorMsg(
          error.response?.data?.message ||
          error.message ||
          "Verification failed. Please try again."
        );
      }
    },
  });

  const {
    values,
    errors,
    isValid,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    handleChange
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        {errorMsg && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              '& .MuiAlert-icon': { color: 'error.main' },
              animation: 'fadeIn 0.5s',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Enter the 6-digit verification code sent to your {verificationType}:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {identifier}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          {Object.keys(values).map((item, index) => (
            <OutlinedInput
              key={item}
              {...getFieldProps(item)}
              type="text"
              placeholder="•"
              onInput={maxLength}
              onChange={(e) => handleChangeWithNextField(
                e,
                getFieldProps,
                handleChange,
                item.replace('code', '')
              )}
              error={Boolean(touched[item] && errors[item])}
              inputProps={{
                maxLength: 1,
                inputMode: 'numeric',
                pattern: '[0-9]*',
                sx: {
                  p: 0,
                  textAlign: "center",
                  width: { xs: 36, sm: 56 },
                  height: { xs: 36, sm: 56 },
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? 'common.white' : 'grey.900',
                },
              }}
              sx={{
                borderRadius: 1,
                '&.Mui-focused': {
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
                }
              }}
            />
          ))}
        </Stack>

        <FormHelperText error={!isValid} sx={{ textAlign: "right", mb: 2 }}>
          {!isValid && "Please enter all digits"}
        </FormHelperText>

        <AuthButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
          startIcon={<Icon icon="eva:checkmark-circle-outline" />}
        >
          Verify Code
        </AuthButton>

        {onResendCode && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Didn't receive a code? {' '}
              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={onResendCode}
              >
                Resend
              </Box>
            </Typography>
          </Box>
        )}
      </Form>
    </FormikProvider>
  );
}
