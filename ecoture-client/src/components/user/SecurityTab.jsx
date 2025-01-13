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
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import UserContext from 'contexts/UserContext';
import http from 'utils/http';
import { toast } from 'react-toastify';

const SecurityTab = () => {
    const { user, setUser } = useContext(UserContext);
    const [is2FAEnabled, setIs2FAEnabled] = useState(user.is2FAEnabled);
    const [authMethods, setAuthMethods] = useState([]);

    const [tempIs2FAEnabled, setTempIs2FAEnabled] = useState(is2FAEnabled);
    const [tempAuthMethods, setTempAuthMethods] = useState(authMethods);
    const [tempUser, setTempUser] = useState({ ...user });
    const [isEditing, setIsEditing] = useState(false);
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('+65 ');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
    const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);

    const availableMethods = ['SMS', 'Email', 'Authenticator'];

    useEffect(() => {
        if (user && user.userId && authMethods.length === 0) {
            // Check if user is valid and userId is non-zero
            const getAuthMethods = async () => {
                try {
                    const res = await http.post('/user/get-mfa', {
                        userId: user.userId
                    });
                    if (res.data) {
                        // Transform the response to extract active MFA methods
                        const mfaMethods = res.data; // assuming response is like { sms: true, email: true, authenticator: false }

                        // Convert object keys with 'true' values to an array
                        const activeMfaMethods = Object.keys(mfaMethods).filter(
                            (key) => mfaMethods[key] && key !== 'userId'
                        );

                        setTempAuthMethods(activeMfaMethods);
                        setAuthMethods(activeMfaMethods);
                    }
                } catch (error) {
                    console.error(error);
                }
            };
            getAuthMethods();
        }
    }, [user]);

    const handleToggle2FA = () => {
        setTempIs2FAEnabled(!tempIs2FAEnabled);
        if (!isEditing) setTempAuthMethods([]); // Reset methods when enabling 2FA
    };

    const handleOpen = (type) => {
        console.log(type);
        if (type === 'phone') setIsVerifyingPhone(true);
        if (type === 'email') setIsVerifyingEmail(true);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handlePhoneNoChange = (e) => {
        let { value } = e.target;

        // Ensure the +65 prefix stays fixed and no leading spaces before the digits
        if (!value.startsWith('+65 ')) {
            value = '+65 ' + value.slice(4);
        }

        // Remove non-numeric characters and reformat to 8-digit phone number
        let numericValue = value.slice(4).replace(/\D/g, '');

        // Format the phone number with space after every 4 digits
        if (numericValue.length > 4) {
            numericValue =
                numericValue.slice(0, 4) + ' ' + numericValue.slice(4, 8);
        }

        // Update the phone number state with the formatted value
        setPhoneNumber('+65 ' + numericValue);
    };
    const handlePhoneOtpSend = async () => {
        // check if phone number is valid
        if (phoneNumber.length !== 13) {
            toast.error('Invalid phone number.');
            return;
        }

        // check if phone number starts with +65 9 or +65 8
        if (
            !phoneNumber.startsWith('+65 9') &&
            !phoneNumber.startsWith('+65 8')
        ) {
            toast.error('Invalid phone number.');
            return;
        }

        setLoading(true);
        try {
            // clean up phone number field
            const updatedPhoneNo = phoneNumber.replaceAll(' ', '').trim();
            // Call your send OTP API
            const res = await http.post('/verify/phone', {
                email: user.email,
                phoneNo: updatedPhoneNo
            });

            console.log(res);
            setIsPhoneOtpSent(true);
            toast.success(res.data);
        } catch (error) {
            toast.error('Error while sending OTP.');
        } finally {
            setLoading(false);
            setIsVerifyingPhone(false);
        }
    };

    const handleVerifyPhoneOtp = async () => {
        setLoading(true);
        try {
            const updatedPhoneNo = phoneNumber.replaceAll(' ', '').trim();
            // Call your verify OTP API
            const res = await http.post('/verify/phone-otp', {
                email: user.email,
                phoneNo: updatedPhoneNo,
                otp
            });

            setTempUser({
                ...tempUser,
                isPhoneVerified: true,
                mobileNo: phoneNumber
            });
            setUser({ ...user, isPhoneVerified: true, mobileNo: phoneNumber });
            toast.success(res.data);
            handleClose();
        } catch (error) {
            toast.error('Error while verifying OTP.');
        } finally {
            setLoading(false);
            setIsVerifyingEmail(false);
        }
    };

    const handleVerifyMobile = () => {
        setIsVerifyingPhone(true);
        handleOpen('phone');
    };

    const handleEmailOtpSend = async () => {
        setLoading(true);
        try {
            // Call your send OTP API
            const res = await http.post('/verify/email', {
                email: user.email
            });

            setIsEmailOtpSent(true);
            toast.success(res.data);
        } catch (error) {
            toast.error('Error while sending OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        setLoading(true);
        try {
            // Call your verify OTP API
            const res = await http.post('/verify/email-otp', {
                email: user.email,
                otp
            });

            setTempUser({ ...tempUser, isEmailVerified: true });
            setUser({ ...user, isEmailVerified: true });
            toast.success(res.data);
            handleClose();
        } catch (error) {
            toast.error('Error while verifying OTP.');
        } finally {
            setLoading(false);
            setIsVerifyingEmail(false);
        }
    };

    const handleEditClick = () => setIsEditing(true);

    const handleCancelClick = () => {
        setTempIs2FAEnabled(is2FAEnabled);
        setTempAuthMethods(authMethods);
        setTempUser({ ...user });
        setError(null); // Clear error on cancel
        setIsEditing(false);
    };

    const handleSaveClick = async () => {
        if (tempIs2FAEnabled && tempAuthMethods.length === 0) {
            setError('You must select at least one authentication method.');
            return;
        }

        if (tempAuthMethods.includes('SMS') && !tempUser.mobileNo) {
            setError('Please set up your mobile number to use OTP.');
            return;
        }

        if (tempAuthMethods.includes('Email') && !tempUser.email) {
            setError('Please set up your email to use this method.');
            return;
        }

        const payload = {
            userId: tempUser.userId, // Assuming tempUser has an id property
            mfaTypes: tempAuthMethods.map((method) => method.toLowerCase()), // Convert methods to lowercase
            enable: tempIs2FAEnabled
        };
        try {
            const res = await http.post('/user/update-mfa', payload);
            if (!res.data) {
                toast.error('Failed to update MFA settings.');
                throw new Error('Failed to update MFA settings.');
            }
            setIs2FAEnabled(tempIs2FAEnabled);
            setAuthMethods(tempAuthMethods);
            setUser({ ...tempUser, is2FAEnabled: tempIs2FAEnabled });
            setError(null); // Clear error on success
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            setError(
                'An error occurred while updating MFA settings. Please try again.'
            );
        }
    };

    const toggleAuthMethod = (method) => {
        if (tempAuthMethods.includes(method)) {
            setTempAuthMethods(tempAuthMethods.filter((m) => m !== method));
        } else {
            setTempAuthMethods([...tempAuthMethods, method]);
        }
    };

    const handleSetUpEmail = () => {
        const newEmail = prompt('Enter your email:');
        if (newEmail)
            setTempUser({
                ...tempUser,
                email: newEmail,
                isEmailVerified: false
            });
    };

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
                    {!isEditing ? (
                        <IconButton onClick={handleEditClick}>
                            <EditIcon />
                        </IconButton>
                    ) : (
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveClick}
                            >
                                Save
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
                            {tempIs2FAEnabled ? 'Enabled' : 'Disabled'}
                        </Typography>
                        {isEditing && (
                            <Switch
                                checked={tempIs2FAEnabled}
                                onChange={handleToggle2FA}
                            />
                        )}
                    </Box>
                </Box>

                {error && (
                    <Typography color="error" marginBottom={2}>
                        {error}
                    </Typography>
                )}

                <Divider />

                {tempIs2FAEnabled && (
                    <Box marginY={3}>
                        <Typography variant="h6">
                            Authentication Methods
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                            {availableMethods.map((method) => (
                                <Chip
                                    key={method}
                                    label={method}
                                    color={
                                        tempAuthMethods.includes(
                                            method.toLowerCase()
                                        )
                                            ? 'primary'
                                            : 'default'
                                    }
                                    onClick={() =>
                                        isEditing &&
                                        toggleAuthMethod(method.toLowerCase())
                                    }
                                    clickable={isEditing}
                                    variant={
                                        tempAuthMethods.includes(
                                            method.toLowerCase()
                                        )
                                            ? 'filled'
                                            : 'outlined'
                                    }
                                />
                            ))}
                        </Box>

                        <Box mt={3}>
                            {tempAuthMethods.includes('sms') && (
                                <Box mb={2}>
                                    <Typography variant="subtitle1">
                                        SMS
                                    </Typography>
                                    {tempUser.mobileNo ? (
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                        >
                                            <Typography>
                                                {tempUser.mobileNo} (
                                                {tempUser.isPhoneVerified
                                                    ? 'Verified'
                                                    : 'Unverified'}
                                                )
                                            </Typography>
                                            {isEditing && (
                                                <Link
                                                    component="button"
                                                    onClick={
                                                        tempUser.isPhoneVerified
                                                            ? () =>
                                                                  handleOpen(
                                                                      'phone'
                                                                  )
                                                            : handleVerifyMobile
                                                    }
                                                    sx={{
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    {tempUser.isPhoneVerified
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
                                                    handleOpen('phone')
                                                }
                                                sx={{
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                Set up
                                            </Link>
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {tempAuthMethods.includes('email') && (
                                <Box mb={2}>
                                    <Typography variant="subtitle1">
                                        Email
                                    </Typography>
                                    {tempUser.email ? (
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                        >
                                            <Typography>
                                                {tempUser.email} (
                                                {tempUser.isEmailVerified
                                                    ? 'Verified'
                                                    : 'Unverified'}
                                                )
                                            </Typography>
                                            {isEditing && (
                                                <Link
                                                    component="button"
                                                    onClick={
                                                        tempUser.isEmailVerified
                                                            ? handleSetUpEmail
                                                            : () =>
                                                                  handleOpen(
                                                                      'email'
                                                                  )
                                                    }
                                                    sx={{
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    {tempUser.isEmailVerified
                                                        ? 'Change'
                                                        : 'Verify'}
                                                </Link>
                                            )}
                                        </Box>
                                    ) : (
                                        <Typography color="error">
                                            No email set.{' '}
                                            <Link onClick={handleSetUpEmail}>
                                                Set up
                                            </Link>
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {tempAuthMethods.includes('authenticator') && (
                                <Box mb={2}>
                                    <Typography variant="subtitle1">
                                        Authenticator App
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                    >
                                        Use an authenticator app like Google
                                        Authenticator or Authy. Setup
                                        instructions will be provided here.
                                    </Typography>
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
                        Deleting your account will permanently remove all your
                        data. This action cannot be undone.
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ mt: 1 }}
                        onClick={() => alert('Account deletion initiated.')}
                    >
                        Delete Account
                    </Button>
                </Box>
            </Paper>

            <Modal open={open} onClose={handleClose}>
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
                        {isVerifyingPhone ? 'Verify Phone' : 'Verify Email'}
                    </Typography>

                    {isVerifyingPhone && !user.isPhoneVerified && (
                        <Box sx={{ marginBottom: 2 }}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Phone Number"
                                    variant="outlined"
                                    value={phoneNumber}
                                    helperText="Enter your 8-digit phone number (e.g. +65 9123 4567)"
                                    inputProps={{
                                        maxLength: 13 // 3 for +65 and 8 digits for the phone number with spaces
                                    }}
                                    onChange={handlePhoneNoChange}
                                    fullWidth
                                    disabled={
                                        isPhoneOtpSent || user.isPhoneVerified
                                    }
                                />
                            </FormControl>
                        </Box>
                    )}

                    {isPhoneOtpSent && !user.isPhoneVerified && (
                        <Box sx={{ marginBottom: 2 }}>
                            <TextField
                                label="SMS"
                                variant="outlined"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                fullWidth
                            />
                        </Box>
                    )}

                    {isVerifyingPhone &&
                        !isPhoneOtpSent &&
                        !user.isPhoneVerified && (
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handlePhoneOtpSend}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    'Send OTP to Phone'
                                )}
                            </Button>
                        )}

                    {isPhoneOtpSent && !user.isPhoneVerified && (
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleVerifyPhoneOtp}
                            disabled={loading}
                            sx={{ marginTop: 2 }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Verify Phone OTP'
                            )}
                        </Button>
                    )}

                    {user.email &&
                        !user.isEmailVerified &&
                        isVerifyingEmail &&
                        !isEmailOtpSent && (
                            <Box sx={{ marginTop: 2 }}>
                                <Typography sx={{ color: 'grey', mb: 2 }}>
                                    {user.email}
                                </Typography>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleEmailOtpSend}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <CircularProgress
                                            size={24}
                                            color="inherit"
                                        />
                                    ) : (
                                        'Send OTP to Email'
                                    )}
                                </Button>
                            </Box>
                        )}

                    {user.email &&
                        !user.isEmailVerified &&
                        isVerifyingEmail &&
                        isEmailOtpSent && (
                            <Box sx={{ marginTop: 2 }}>
                                <TextField
                                    label="Email OTP"
                                    variant="outlined"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    fullWidth
                                />
                            </Box>
                        )}

                    {user.email &&
                        !user.isEmailVerified &&
                        isVerifyingEmail &&
                        isEmailOtpSent && (
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleVerifyEmailOtp}
                                disabled={loading}
                                sx={{ marginTop: 2 }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    'Verify Email OTP'
                                )}
                            </Button>
                        )}
                </Box>
            </Modal>
        </Box>
    );
};

export default SecurityTab;
