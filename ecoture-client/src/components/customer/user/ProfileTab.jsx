/* eslint-disable react/prop-types */
import {
    Avatar,
    Box,
    Divider,
    Grid,
    IconButton,
    Paper,
    Typography,
    TextField,
    Button,
    Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { styled } from '@mui/material/styles';
import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import http from 'utils/http';
import UserContext from 'contexts/UserContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Lock } from '@mui/icons-material';
import { Modal, CircularProgress, Dialog } from '@mui/material';

const UploadInput = styled('input')({
    display: 'none'
});

const validationSchema = yup.object({
    firstName: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(100, 'First name must be at most 100 characters')
        .matches(
            /^[A-Za-z\s'-.,]+$/,
            "Only letters, spaces, and characters: ' - , . are allowed"
        ),
    lastName: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(100, 'Last name must be at most 100 characters')
        .matches(
            /^[A-Za-z\s'-.,]+$/,
            "Only letters, spaces, and characters: ' - , . are allowed"
        ),
    email: yup
        .string()
        .email('Invalid email address')
        .max(50, 'Email must be at most 50 characters')
        .required('Email is required'),
    mobileNo: yup
        .string()
        .matches(
            /^\+65 [89]\d{3} \d{4}$/,
            'Phone number must be in format: +65 XXXX XXXX'
        )
        .nullable(),
    dateofBirth: yup
        .date()
        .nullable()
        .test('futureDate', 'Date of birth must be before today', (value) => {
            if (!value) return true;
            return new Date(value).getTime() < new Date().setHours(0, 0, 0, 0);
        })
});

const ProfileTab = ({ user }) => {
    const { setUser } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);

    // Add these states to your ProfileTab component
    const [modalConfig, setModalConfig] = useState({
        open: false,
        type: '', // 'email' or 'phone'
        otpSent: false,
        loading: false,
        otp: '',
        newValue: '' // Store new email/phone temporarily
    });

    const [showPasswordDialog, setShowPasswordDialog] = useState(false);

    // Add password change formik
    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema: yup.object({
            currentPassword: yup
                .string()
                .min(8, 'Password must be at least 8 characters')
                .matches(
                    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])/,
                    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                )
                .required('Current password is required'),
            newPassword: yup
                .string()
                .min(8, 'Password must be at least 8 characters')
                .matches(
                    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])/,
                    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                )
                .required('New password is required'),
            confirmPassword: yup
                .string()
                .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
                .required('Confirm password is required')
        }),
        onSubmit: async (values) => {
            try {
                await http.post('/user/change-password', {
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword
                });
                toast.success('Password changed successfully');
                setShowPasswordDialog(false);
                passwordFormik.resetForm();
            } catch (error) {
                toast.error(
                    error.response?.data?.message || 'Failed to change password'
                );
            }
        }
    });

    useEffect(() => {
        let timer;
        if (modalConfig.otpSent && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }

        if (countdown === 0) {
            setCanResend(true);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [countdown, modalConfig.otpSent]);

    const handleResend = () => {
        if (canResend) {
            handleOtpSend();
            setCountdown(30);
            setCanResend(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            mobileNo: user.mobileNo || '',
            dateofBirth: user.dateofBirth ? user.dateofBirth.split('T')[0] : '',
            pfpURL: user.pfpURL || ''
        },
        validationSchema,
        onSubmit: async (values) => {
            if (!formik.dirty) {
                setIsEditing(false);
                toast.info('No changes detected'); // Changed to info message
                return;
            }

            // Create a copy of values to modify
            const submitValues = { ...values };

            // Handle date formatting
            if (submitValues.dateofBirth === '') {
                submitValues.dateofBirth = null;
            } else if (submitValues.dateofBirth) {
                // Ensure the date is in ISO format
                submitValues.dateofBirth = new Date(
                    submitValues.dateofBirth
                ).toISOString();
            }

            // Check if email has changed and needs verification
            if (submitValues.email !== user.email) {
                handleVerificationNeeded('email', submitValues.email);
                return;
            }

            // Check if phone number has changed and needs verification
            if (submitValues.mobileNo !== user.mobileNo) {
                handleVerificationNeeded('phone', submitValues.mobileNo);
                return;
            }

            try {
                const response = await http.post(
                    '/user/edit-profile',
                    submitValues
                );

                if (response.data.user) {
                    const fullName =
                        `${response.data.user.firstName} ${response.data.user.lastName}`
                            .replace('Empty', '')
                            .trim();

                    const updatedUser = {
                        ...user,
                        ...response.data.user,
                        fullName
                    };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    toast.success('Profile updated successfully');
                    setIsEditing(false);
                }
            } catch (error) {
                toast.error(
                    error.response?.data?.message || 'Failed to update profile'
                );
            }
        }
    });

    // Add these handlers for verification
    const handleVerificationNeeded = (type, newValue) => {
        console.log('Opening modal for:', type, newValue); // Debug log
        setModalConfig({
            open: true,
            type,
            otpSent: false,
            loading: false,
            otp: '',
            newValue
        });
    };

    const handleOtpSend = async () => {
        setModalConfig((prev) => ({ ...prev, loading: true }));
        try {
            const endpoint =
                modalConfig.type === 'email'
                    ? '/verify/change-email'
                    : '/verify/phone';
            const payload = {
                userId: user.userId,
                email: user.email,
                ...(modalConfig.type === 'email' && {
                    newEmail: modalConfig.newValue
                }),
                ...(modalConfig.type === 'phone' && {
                    phoneNo: modalConfig.newValue.replaceAll(' ', '').trim()
                })
            };

            await http.post(endpoint, payload);
            setModalConfig((prev) => ({ ...prev, otpSent: true }));
            toast.success('OTP sent successfully');
        } catch (error) {
            toast.error('Failed to send OTP');
        } finally {
            setModalConfig((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleOtpVerify = async () => {
        setModalConfig((prev) => ({ ...prev, loading: true }));
        try {
            const endpoint =
                modalConfig.type === 'email'
                    ? '/verify/change-email-otp'
                    : '/verify/phone-otp';
            const payload = {
                userId: user.userId,
                email: user.email,
                otp: modalConfig.otp,
                ...(modalConfig.type === 'phone' && {
                    phoneNo: modalConfig.newValue.replaceAll(' ', '').trim()
                })
            };

            const res = await http.post(endpoint, payload);
            if (res.data) {
                // After successful verification, update the profile
                const submitValues = {
                    ...formik.values,
                    [modalConfig.type === 'email' ? 'email' : 'mobileNo']:
                        modalConfig.newValue,
                    dateofBirth: formik.values.dateofBirth
                        ? new Date(formik.values.dateofBirth).toISOString()
                        : null
                };

                // Make the profile update API call
                const updateResponse = await http.post(
                    '/user/edit-profile',
                    submitValues
                );

                if (updateResponse.data.user) {
                    // Add fullName construction here
                    const fullName =
                        `${updateResponse.data.user.firstName} ${updateResponse.data.user.lastName}`
                            .replace('Empty', '')
                            .trim();

                    const updatedUser = {
                        ...user,
                        ...updateResponse.data.user,
                        fullName
                    };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    toast.success('Profile updated successfully');
                    setIsEditing(false);
                }

                handleCloseModal();
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to verify OTP'
            );
        } finally {
            setModalConfig((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleCloseModal = () => {
        setModalConfig((prev) => ({
            ...prev,
            open: false,
            otpSent: false,
            otp: ''
        }));
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        formik.resetForm();
        setImagePreview(null);
        setIsEditing(false);
    };

    const handlePhoneNumberChange = (e) => {
        let { value } = e.target;
        if (!value.startsWith('+65 ')) {
            value = '+65 ' + value.slice(4);
        }
        let numericValue = value.slice(4).replace(/\D/g, '');
        if (numericValue.length > 4) {
            numericValue =
                numericValue.slice(0, 4) + ' ' + numericValue.slice(4, 8);
        }
        const formattedNumber = '+65 ' + numericValue;
        formik.setFieldValue('mobileNo', formattedNumber);
    };

    const handleImageChange = async (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            if (file.size > 5000000) {
                toast.error('File size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            try {
                const formData = new FormData();
                formData.append('image', file);

                const response = await http.post(
                    '/user/upload-profile-image',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                if (response.data.imageUrl) {
                    formik.setFieldValue('pfpURL', response.data.imageUrl);
                    toast.success('Profile image uploaded successfully');
                }
            } catch (error) {
                toast.error('Failed to upload image');
                setImagePreview(null);
            }
        }
    };

    return (
        <>
            <Box sx={{ flex: 1 }}>
                <Paper elevation={2} sx={{ padding: 4 }}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h5">Profile</Typography>
                        {!isEditing ? (
                            <IconButton onClick={handleEditClick}>
                                <EditIcon />
                            </IconButton>
                        ) : (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    onClick={formik.handleSubmit}
                                    sx={{
                                        backgroundColor: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'primary.light'
                                        }
                                    }}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancelClick}
                                >
                                    Cancel
                                </Button>
                            </Stack>
                        )}
                    </Box>

                    <Box
                        display={'flex'}
                        flexDirection={'row'}
                        gap={3}
                        mb={4}
                        mt={2}
                    >
                        <Box position="relative">
                            {imagePreview || formik.values.pfpURL ? (
                                <img
                                    src={imagePreview || formik.values.pfpURL}
                                    alt="User Avatar"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <Avatar sx={{ width: 80, height: 80 }} />
                            )}
                            {isEditing && (
                                <Box
                                    position="absolute"
                                    bottom={-10}
                                    right={-10}
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        padding: '4px',
                                        boxShadow: 1
                                    }}
                                >
                                    <label htmlFor="icon-button-file">
                                        <UploadInput
                                            accept="image/*"
                                            id="icon-button-file"
                                            type="file"
                                            onChange={handleImageChange}
                                        />
                                        <IconButton
                                            color="primary"
                                            aria-label="upload picture"
                                            component="span"
                                            size="small"
                                        >
                                            <AddAPhotoIcon />
                                        </IconButton>
                                    </label>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                        Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            {isEditing ? (
                                <>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={formik.values.firstName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.firstName &&
                                            Boolean(formik.errors.firstName)
                                        }
                                        helperText={
                                            formik.touched.firstName &&
                                            formik.errors.firstName
                                        }
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formik.values.lastName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.lastName &&
                                            Boolean(formik.errors.lastName)
                                        }
                                        helperText={
                                            formik.touched.lastName &&
                                            formik.errors.lastName
                                        }
                                        margin="normal"
                                    />
                                </>
                            ) : (
                                <Typography variant="body1">
                                    Name:{' '}
                                    {`${formik.values.firstName} ${formik.values.lastName}`.trim()}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            {isEditing ? (
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.email &&
                                        Boolean(formik.errors.email)
                                    }
                                    helperText={
                                        formik.touched.email &&
                                        formik.errors.email
                                    }
                                    margin="normal"
                                />
                            ) : (
                                <Typography variant="body1">
                                    Email Address: {formik.values.email}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            {isEditing ? (
                                <TextField
                                    fullWidth
                                    label="Mobile Number"
                                    name="mobileNo"
                                    value={formik.values.mobileNo}
                                    onChange={handlePhoneNumberChange} // Use custom handler instead of formik.handleChange
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.mobileNo &&
                                        Boolean(formik.errors.mobileNo)
                                    }
                                    helperText={
                                        (formik.touched.mobileNo &&
                                            formik.errors.mobileNo) ||
                                        'Format: +65 XXXX XXXX'
                                    }
                                    margin="normal"
                                    inputProps={{
                                        maxLength: 13 // +65 XXXX XXXX
                                    }}
                                />
                            ) : (
                                <Typography variant="body1">
                                    Mobile Number:{' '}
                                    {formik.values.mobileNo || 'Not set'}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            {isEditing ? (
                                <TextField
                                    fullWidth
                                    label="Date of Birth"
                                    name="dateofBirth"
                                    type="date"
                                    value={formik.values.dateofBirth}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.dateofBirth &&
                                        Boolean(formik.errors.dateofBirth)
                                    }
                                    helperText={
                                        formik.touched.dateofBirth &&
                                        formik.errors.dateofBirth
                                    }
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                />
                            ) : (
                                <Typography variant="body1">
                                    Date of Birth:{' '}
                                    {formik.values.dateofBirth
                                        ? new Date(
                                              formik.values.dateofBirth
                                          ).toLocaleDateString()
                                        : 'Not set'}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            {!isEditing && (
                                <Button
                                    startIcon={<Lock />}
                                    onClick={() => setShowPasswordDialog(true)}
                                >
                                    Change Password
                                </Button>
                            )}
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                        Delivery Address
                    </Typography>
                    <Typography variant="body1">
                        123 Main Street, City, Country
                    </Typography>
                    <Typography variant="body1">Postal Code: 123456</Typography>
                </Paper>
            </Box>
            {/* Verification Modal */}
            <Modal open={modalConfig.open} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h6" component="h2" gutterBottom>
                        {`Verify ${
                            modalConfig.type === 'email'
                                ? 'Email'
                                : 'Phone Number'
                        }`}
                    </Typography>

                    {!modalConfig.otpSent ? (
                        <>
                            <Typography sx={{ mt: 2 }}>
                                {`We'll send a verification code to ${modalConfig.newValue}`}
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleOtpSend}
                                disabled={modalConfig.loading}
                                sx={{ mt: 2 }}
                            >
                                {modalConfig.loading ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    'Send Verification Code'
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <TextField
                                fullWidth
                                label="Verification Code"
                                value={modalConfig.otp}
                                onChange={(e) =>
                                    setModalConfig((prev) => ({
                                        ...prev,
                                        otp: e.target.value
                                    }))
                                }
                                margin="normal"
                            />
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    mt: 1,
                                    mb: 2
                                }}
                            >
                                {countdown > 0 ? (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Resend code in {countdown}s
                                    </Typography>
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="primary"
                                        sx={{
                                            cursor: canResend
                                                ? 'pointer'
                                                : 'default',
                                            '&:hover': canResend
                                                ? {
                                                      textDecoration:
                                                          'underline'
                                                  }
                                                : {}
                                        }}
                                        onClick={handleResend}
                                    >
                                        Resend code
                                    </Typography>
                                )}
                            </Box>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleOtpVerify}
                                disabled={
                                    modalConfig.loading || !modalConfig.otp
                                }
                                sx={{ mt: 2 }}
                            >
                                {modalConfig.loading ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    'Verify'
                                )}
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>
            {/* Password Change Dialog */}
            <Dialog
                open={showPasswordDialog}
                onClose={() => setShowPasswordDialog(false)}
            >
                <Box sx={{ p: 2, width: 400 }}>
                    <Typography variant="h6" gutterBottom>
                        Change Password
                    </Typography>
                    <form onSubmit={passwordFormik.handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            name="currentPassword"
                            label="Current Password"
                            type="password"
                            value={passwordFormik.values.currentPassword}
                            onChange={passwordFormik.handleChange}
                            error={
                                passwordFormik.touched.currentPassword &&
                                Boolean(passwordFormik.errors.currentPassword)
                            }
                            helperText={
                                passwordFormik.touched.currentPassword &&
                                passwordFormik.errors.currentPassword
                            }
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            name="newPassword"
                            label="New Password"
                            type="password"
                            value={passwordFormik.values.newPassword}
                            onChange={passwordFormik.handleChange}
                            error={
                                passwordFormik.touched.newPassword &&
                                Boolean(passwordFormik.errors.newPassword)
                            }
                            helperText={
                                passwordFormik.touched.newPassword &&
                                passwordFormik.errors.newPassword
                            }
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            name="confirmPassword"
                            label="Confirm New Password"
                            type="password"
                            value={passwordFormik.values.confirmPassword}
                            onChange={passwordFormik.handleChange}
                            error={
                                passwordFormik.touched.confirmPassword &&
                                Boolean(passwordFormik.errors.confirmPassword)
                            }
                            helperText={
                                passwordFormik.touched.confirmPassword &&
                                passwordFormik.errors.confirmPassword
                            }
                        />
                        <Box
                            sx={{
                                mt: 2,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 1
                            }}
                        >
                            <Button
                                onClick={() => setShowPasswordDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained">
                                Change Password
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Dialog>
        </>
    );
};

export default ProfileTab;
