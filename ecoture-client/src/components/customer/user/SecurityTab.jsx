import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Divider,
    Switch,
    Stack,
    Chip,
    IconButton,
    Link,
    TextField,
    Modal,
    FormControl,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import UserContext from 'contexts/UserContext';
import http from 'utils/http';
import { toast } from 'react-toastify';

const SecurityTab = () => {
    const AVAILABLE_METHODS = ['SMS', 'Email', 'Authenticator'];
    const { user, setUser } = useContext(UserContext);

    const [securityState, setSecurityState] = useState({
        is2FAEnabled: user.is2FAEnabled,
        authMethods: [],
        isEditing: false,
        error: null,
        tempUser: { ...user }
    });

    const [modalState, setModalState] = useState({
        open: false,
        type: '',
        otpSent: false,
        loading: false,
        otp: '',
        isChange: false
    });

    const [phoneNumber, setPhoneNumber] = useState('+65 ');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const handleResend = () => {
        if (canResend) {
            handleOtpSend();
            setCountdown(30);
            setCanResend(false);
        }
    };

    // Effects
    useEffect(() => {
        if (user?.userId && securityState.authMethods.length === 0) {
            fetchAuthMethods();
        }
    }, [user]);

    useEffect(() => {
        let timer;
        if (modalState.otpSent && countdown > 0) {
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
    }, [countdown, modalState.otpSent]);

    // API Calls
    const fetchAuthMethods = async () => {
        try {
            const res = await http.post('/user/get-mfa', {
                userId: user.userId
            });
            if (res.data) {
                const activeMethods = Object.keys(res.data).filter(
                    (key) => res.data[key] && key !== 'userId'
                );
                updateSecurityState({ authMethods: activeMethods });
            }
        } catch (error) {
            toast.error('Failed to fetch authentication methods');
        }
    };

    const updateUserSettings = async () => {
        const payload = {
            userId: securityState.tempUser.userId,
            is2FAEnabled: securityState.is2FAEnabled,
            mfaMethods: securityState.authMethods,
            mobileNo: securityState.tempUser.mobileNo,
            isEmailVerified: securityState.tempUser.isEmailVerified,
            isPhoneVerified: securityState.tempUser.isPhoneVerified
        };

        return await http.post('/user/edit-profile', payload);
    };

    // Helper Functions
    const updateSecurityState = (newState) => {
        setSecurityState((prev) => ({ ...prev, ...newState }));
    };

    const updateModalState = (newState) => {
        setModalState((prev) => ({ ...prev, ...newState }));
    };

    const checkMethodVerification = () => {
        for (const method of securityState.authMethods) {
            if (
                (method === 'sms' && !securityState.tempUser.isPhoneVerified) ||
                (method === 'email' && !securityState.tempUser.isEmailVerified)
            ) {
                return {
                    isValid: false,
                    message: `Please verify your ${method} to enable it.`
                };
            }
        }
        return { isValid: true };
    };

    const handleError = (message) => {
        toast.error(message);
        updateSecurityState({ error: message });
    };

    // Event Handlers
    const handleToggle2FA = () => {
        updateSecurityState({
            is2FAEnabled: !securityState.is2FAEnabled,
            tempUser: {
                ...securityState.tempUser,
                is2FAEnabled: !securityState.is2FAEnabled
            },
            authMethods: !securityState.is2FAEnabled
                ? []
                : securityState.authMethods
        });
    };

    const handleEditClick = () => {
        updateSecurityState({ isEditing: true });
    };

    const handleCancelClick = () => {
        updateSecurityState({
            is2FAEnabled: user.is2FAEnabled,
            authMethods: securityState.authMethods,
            tempUser: { ...user },
            error: null,
            isEditing: false
        });
    };

    const handleSaveClick = async () => {
        if (
            securityState.is2FAEnabled &&
            securityState.authMethods.length === 0
        ) {
            updateSecurityState({
                error: 'You must select at least one authentication method.'
            });
            return;
        }

        const verificationCheck = checkMethodVerification();
        if (!verificationCheck.isValid) {
            toast.error(verificationCheck.message);
            return;
        }

        try {
            const response = await updateUserSettings();
            if (response.data) {
                console.log('hello', response.data);
                console.log('security', securityState);
                setUser({
                    ...user,
                    is2FAEnabled: securityState.is2FAEnabled,
                    ...securityState.tempUser
                });
                updateSecurityState({
                    error: null,
                    isEditing: false
                });
                toast.success('Settings updated successfully');
            }
        } catch (error) {
            handleError('Failed to update settings');
        }
    };

    const handleMethodToggle = (method) => {
        const updatedMethods = securityState.authMethods.includes(method)
            ? securityState.authMethods.filter((m) => m !== method)
            : [...securityState.authMethods, method];
        updateSecurityState({ authMethods: updatedMethods });
    };

    // Phone and Email Verification Handlers
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
        setPhoneNumber('+65 ' + numericValue);
    };

    const handleOpenModal = (type, isChange = false) => {
        updateModalState({
            open: true,
            type,
            otpSent: false,
            loading: false,
            otp: '',
            isChange
        });
    };

    const handleCloseModal = () => {
        updateModalState({ open: false });
    };

    const handleOtpSend = async (type) => {
        updateModalState({ loading: true });
        try {
            const endpoint =
                type === 'email' ? '/verify/email' : '/verify/phone';
            const payload = {
                email: user.email,
                ...(type === 'phone' && {
                    phoneNo: phoneNumber.replaceAll(' ', '').trim()
                })
            };

            const res = await http.post(endpoint, payload);
            updateModalState({ otpSent: true });
            toast.success('OTP sent successfully');
        } catch (error) {
            handleError('Failed to send OTP');
        } finally {
            updateModalState({ loading: false });
        }
    };

    const handleOtpVerify = async (type) => {
        updateModalState({ loading: true });
        try {
            const endpoint =
                type === 'email' ? '/verify/email-otp' : '/verify/phone-otp';
            const payload = {
                email: user.email,
                otp: modalState.otp,
                ...(type === 'phone' && {
                    phoneNo: phoneNumber.replaceAll(' ', '').trim()
                })
            };

            const res = await http.post(endpoint, payload);
            if (res.data) {
                const updates =
                    type === 'email'
                        ? { isEmailVerified: true }
                        : { isPhoneVerified: true, mobileNo: phoneNumber };

                setUser({ ...user, ...updates });
                updateSecurityState({
                    tempUser: { ...securityState.tempUser, ...updates }
                });
                handleCloseModal();
                toast.success('Verification successful');
            }
        } catch (error) {
            handleError('Failed to verify OTP');
        } finally {
            updateModalState({ loading: false });
        }
    };

    // Account Deletion Handlers
    const handleOpenDeleteDialog = () => {
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleAccountDeletion = async () => {
        try {
            await http.post(`/user/${user.userId}/delete-request`);
            toast.success(
                'Your account will be disabled for 30 days before permanent deletion. You can undo this action by logging in again within this period.'
            );
            localStorage.clear();
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            toast.error('Error requesting account deletion.');
        } finally {
            setOpenDeleteDialog(false);
        }
    };

    // Render Methods
    const renderVerificationModal = () => (
        <Modal open={modalState.open} onClose={handleCloseModal}>
            <Box
                sx={{
                    width: 400,
                    margin: 'auto',
                    padding: 4,
                    backgroundColor: 'white',
                    borderRadius: 2
                }}
            >
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                    {modalState.isChange
                        ? `Change ${
                              modalState.type.charAt(0).toUpperCase() +
                              modalState.type.slice(1)
                          }`
                        : `Verify ${
                              modalState.type.charAt(0).toUpperCase() +
                              modalState.type.slice(1)
                          }`}
                </Typography>

                {modalState.type === 'phone' && (
                    <Box sx={{ marginBottom: 2 }}>
                        <FormControl fullWidth>
                            <TextField
                                label="Phone Number"
                                variant="outlined"
                                value={phoneNumber}
                                helperText="Enter your 8-digit phone number (e.g. +65 9123 4567)"
                                inputProps={{ maxLength: 13 }}
                                onChange={handlePhoneNumberChange}
                                fullWidth
                                disabled={
                                    modalState.loading || modalState.otpSent
                                }
                            />
                        </FormControl>
                    </Box>
                )}

                {modalState.otpSent && (
                    <Box sx={{ marginBottom: 2 }}>
                        <TextField
                            label={`${modalState.type.toUpperCase()} OTP`}
                            variant="outlined"
                            value={modalState.otp}
                            onChange={(e) =>
                                updateModalState({ otp: e.target.value })
                            }
                            fullWidth
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
                                                  textDecoration: 'underline'
                                              }
                                            : {}
                                    }}
                                    onClick={handleResend}
                                >
                                    Resend code
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}

                {!modalState.otpSent ? (
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleOtpSend(modalState.type)}
                        disabled={modalState.loading}
                    >
                        {modalState.loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            `Send OTP to ${
                                modalState.type === 'email' ? 'Email' : 'Phone'
                            }`
                        )}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleOtpVerify(modalState.type)}
                        disabled={modalState.loading}
                    >
                        {modalState.loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Verify OTP'
                        )}
                    </Button>
                )}
            </Box>
        </Modal>
    );

    const renderDeleteDialog = () => (
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
            <DialogTitle>Delete Account?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete your account? This action
                    will disable your account for 30 days. You can undo this
                    action by logging in again within this period. After 30
                    days, your account will be permanently deleted.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDeleteDialog} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleAccountDeletion}
                    color="error"
                    variant="contained"
                >
                    Delete My Account
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ padding: 4 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom={3}
                >
                    <Typography variant="h5">Security</Typography>
                    {!securityState.isEditing ? (
                        <IconButton onClick={handleEditClick}>
                            <EditIcon />
                        </IconButton>
                    ) : (
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveClick}
                                sx={{
                                    backgroundColor: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.light'
                                    },
                                    textTransform: 'none'
                                }}
                            >
                                SAVE
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    )}
                </Box>

                <Box marginBottom={3}>
                    <Typography variant="h6">
                        Two-Factor Authentication
                    </Typography>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mt={1}
                    >
                        <Typography>
                            {securityState.is2FAEnabled
                                ? 'Enabled'
                                : 'Disabled'}
                        </Typography>
                        {securityState.isEditing && (
                            <Switch
                                checked={securityState.is2FAEnabled}
                                onChange={handleToggle2FA}
                            />
                        )}
                    </Box>
                </Box>

                {securityState.error && (
                    <Typography color="error" marginBottom={2}>
                        {securityState.error}
                    </Typography>
                )}

                <Divider />

                {securityState.is2FAEnabled && (
                    <Box marginY={3}>
                        <Typography variant="h6">
                            Authentication Methods
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                            {AVAILABLE_METHODS.map((method) => (
                                <Chip
                                    key={method}
                                    label={method}
                                    color={
                                        securityState.authMethods.includes(
                                            method.toLowerCase()
                                        )
                                            ? 'primary'
                                            : 'default'
                                    }
                                    onClick={() =>
                                        securityState.isEditing &&
                                        handleMethodToggle(method.toLowerCase())
                                    }
                                    clickable={securityState.isEditing}
                                    variant={
                                        securityState.authMethods.includes(
                                            method.toLowerCase()
                                        )
                                            ? 'filled'
                                            : 'outlined'
                                    }
                                />
                            ))}
                        </Box>

                        <Box mt={3}>
                            {securityState.authMethods.includes('sms') && (
                                <Box mb={2}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: '600' }}
                                    >
                                        SMS
                                    </Typography>
                                    {securityState.tempUser.mobileNo ? (
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                        >
                                            <Typography>
                                                {
                                                    securityState.tempUser
                                                        .mobileNo
                                                }
                                                (
                                                {securityState.tempUser
                                                    .isPhoneVerified
                                                    ? 'Verified'
                                                    : 'Unverified'}
                                                )
                                            </Typography>
                                            {securityState.isEditing && (
                                                <Link
                                                    component="button"
                                                    onClick={() =>
                                                        handleOpenModal(
                                                            'phone',
                                                            securityState
                                                                .tempUser
                                                                .isPhoneVerified
                                                        )
                                                    }
                                                    sx={{
                                                        textDecoration: 'none',
                                                        color: 'primary.main',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem',
                                                        transition:
                                                            'color 0.2s ease-in-out',
                                                        '&:hover': {
                                                            color: 'primary.light',
                                                            textDecoration:
                                                                'underline'
                                                        }
                                                    }}
                                                >
                                                    {securityState.tempUser
                                                        .isPhoneVerified
                                                        ? 'Change'
                                                        : 'Verify'}
                                                </Link>
                                            )}
                                        </Box>
                                    ) : (
                                        <Typography color="error">
                                            No mobile number set.{' '}
                                            <Link
                                                onClick={() =>
                                                    handleOpenModal('phone')
                                                }
                                                sx={{
                                                    textDecoration: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Set up
                                            </Link>
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {securityState.authMethods.includes('email') && (
                                <Box mb={2}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: '600' }}
                                    >
                                        Email
                                    </Typography>
                                    {securityState.tempUser.email ? (
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                        >
                                            <Typography>
                                                {securityState.tempUser.email}(
                                                {securityState.tempUser
                                                    .isEmailVerified
                                                    ? 'Verified'
                                                    : 'Unverified'}
                                                )
                                            </Typography>
                                            {securityState.isEditing && (
                                                <Link
                                                    component="button"
                                                    onClick={() =>
                                                        handleOpenModal(
                                                            'email',
                                                            securityState
                                                                .tempUser
                                                                .isEmailVerified
                                                        )
                                                    }
                                                    sx={{
                                                        textDecoration: 'none',
                                                        color: 'primary.main',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem',
                                                        transition:
                                                            'color 0.2s ease-in-out',
                                                        '&:hover': {
                                                            color: 'primary.light',
                                                            textDecoration:
                                                                'underline'
                                                        }
                                                    }}
                                                >
                                                    {securityState.tempUser
                                                        .isEmailVerified
                                                        ? 'Change'
                                                        : 'Verify'}
                                                </Link>
                                            )}
                                        </Box>
                                    ) : (
                                        <Typography color="error">
                                            No email set.
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}

                <Divider />

                <Box marginTop={3}>
                    <Typography variant="h6" color="error">
                        Delete Account
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                        Deleting your account will disable it for 30 days before
                        permanent deletion. You can undo this action by logging
                        in again within this period.
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ mt: 2 }}
                        onClick={handleOpenDeleteDialog}
                    >
                        Delete Account
                    </Button>
                </Box>
            </Paper>

            {renderVerificationModal()}
            {renderDeleteDialog()}
        </Box>
    );
};

export default SecurityTab;
