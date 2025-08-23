import * as Yup from "yup";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useFormik, Form, FormikProvider } from "formik";
import eyeFill from "@iconify/icons-eva/eye-fill";
import eyeOffFill from "@iconify/icons-eva/eye-off-fill";
// material
import {
    Stack,
    TextField,
    IconButton,
    InputAdornment,
    Alert,
    MenuItem,
    FormHelperText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// Remove this import
// import MuiPhoneNumber from "material-ui-phone-number";
import AuthService from "../../../services/auth.service";

export default function PhoneRegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [countryCode, setCountryCode] = useState("+44"); // Default to UK

    const countries = [
        { code: "+44", label: "UK", flag: "🇬🇧" },
        { code: "+1", label: "USA/Canada", flag: "🇺🇸" },
        { code: "+353", label: "Ireland", flag: "🇮🇪" },
        { code: "+61", label: "Australia", flag: "🇦🇺" },
        { code: "+64", label: "New Zealand", flag: "🇳🇿" }
    ];

    const PhoneRegisterSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, "Name is too short")
            .max(50, "Name is too long")
            .required("Name is required"),
        phoneNumber: Yup.string()
            .required("Phone number is required")
            .matches(
                /^[0-9]{7,15}$/,
                "Please enter a valid phone number (digits only)"
            ),
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
            phoneNumber: "",
            password: "",
        },
        validationSchema: PhoneRegisterSchema,
        onSubmit: async (values, { setErrors, setSubmitting }) => {
            try {
                setSubmitting(true);
                // Format full phone with country code
                const fullPhone = `${countryCode}${values.phoneNumber}`;

                const registerResp = await AuthService.register(
                    values.name,
                    fullPhone,
                    values.password,
                    "phone"
                );
                if (registerResp.err) {
                    setErrors({ afterSubmit: registerResp.err });
                } else {
                    window.location.replace(`/dashboard`);
                }
                setSubmitting(false);
            } catch (err) {
                setErrors({ afterSubmit: err.message || "Registration failed" });
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

                    <TextField
                        fullWidth
                        label="Full name"
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

                    <Stack direction="row" spacing={2}>
                        <TextField
                            select
                            label="Code"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            sx={{ width: '30%' }}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        sx: { maxHeight: 250 }
                                    }
                                }
                            }}
                        >
                            {countries.map((country) => (
                                <MenuItem key={country.code} value={country.code}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <span>{country.flag}</span>
                                        <span>{country.code}</span>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Phone number"
                            placeholder={countryCode === '+44' ? "7123456789" : "Phone number"}
                            {...getFieldProps("phoneNumber")}
                            error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                            helperText={touched.phoneNumber && errors.phoneNumber}
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*'
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Icon icon="eva:phone-outline" width={20} height={20} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>
                    <FormHelperText>Enter number without leading zeros or country code</FormHelperText>

                    <TextField
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
                                        onClick={() => setShowPassword((prev) => !prev)}
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

                    <LoadingButton
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                    >
                        Register with Phone
                    </LoadingButton>
                </Stack>
            </Form>
        </FormikProvider>
    );
}