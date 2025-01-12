import React from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Divider,
    Grid,
    Button,
    TextField,
    Avatar,
    Tabs,
    Tab,
    Card,
    CardContent
} from '@mui/material';
import { useState } from 'react';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DataTable from '../DataTable';

const MembershipTab = () => {
    const [vouchers, setVouchers] = useState([
        {
            voucherCode: 'V12345',
            customerName: 'John Doe',
            rewardType: 'Discount',
            amount: '15%',
            expiryDate: '2025-06-30',
            status: 'Active'
        },
        {
            voucherCode: 'V23456',
            customerName: 'Jane Smith',
            rewardType: 'Cashback',
            amount: '$10',
            expiryDate: '2025-03-15',
            status: 'Redeemed'
        },
        {
            voucherCode: 'V34567',
            customerName: 'Alice Johnson',
            rewardType: 'Free Item',
            amount: 'Free Coffee',
            expiryDate: '2025-12-01',
            status: 'Active'
        },
        {
            voucherCode: 'V45678',
            customerName: 'Bob Williams',
            rewardType: 'Discount',
            amount: '25%',
            expiryDate: '2025-07-20',
            status: 'Expired'
        },
        {
            voucherCode: 'V56789',
            customerName: 'Charlie Brown',
            rewardType: 'Cashback',
            amount: '$20',
            expiryDate: '2025-04-10',
            status: 'Active'
        },
        {
            voucherCode: 'V67890',
            customerName: 'Diana Green',
            rewardType: 'Free Item',
            amount: 'Free Shipping',
            expiryDate: '2025-05-10',
            status: 'Active'
        },
        {
            voucherCode: 'V78901',
            customerName: 'Eve White',
            rewardType: 'Discount',
            amount: '30%',
            expiryDate: '2025-11-01',
            status: 'Redeemed'
        }
    ]);

    const columns = [
        {
            accessorKey: 'voucherCode',
            header: 'Voucher Code'
        },
        {
            accessorKey: 'customerName',
            header: 'Customer Name'
        },
        {
            accessorKey: 'rewardType',
            header: 'Reward Type'
        },
        {
            accessorKey: 'amount',
            header: 'Amount / Value'
        },
        {
            accessorKey: 'expiryDate',
            header: 'Expiry Date'
        },
        {
            accessorKey: 'status',
            header: 'Status'
        }
    ];

    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    return (
        <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ padding: 4 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="h5">Membership</Typography>
                </Box>

                <Box mt={4} mb={2}>
                    <Typography variant="h6">You are a Gold Member</Typography>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Typography variant="body1">Gold</Typography>
                        <Typography variant="body1">Platinum</Typography>
                    </Box>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Card
                            sx={{
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'grey.400'
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6">Points</Typography>
                                <Typography variant="h4">1000</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card
                            sx={{
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'grey.400'
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6">
                                    Membership Barcode
                                </Typography>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        margin: '0 auto',
                                        bgcolor: 'grey.300'
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card
                            sx={{
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'grey.400'
                            }}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Typography variant="h6">
                                        Referral
                                    </Typography>
                                    <IconButton>
                                        <ShareIcon />
                                    </IconButton>
                                </Box>
                                <Box
                                    sx={{ display: 'flex', alignItems: 'end' }}
                                >
                                    <Typography variant="h4">AWOMS</Typography>
                                    <IconButton>
                                        <ContentCopyIcon
                                            sx={{ fontSize: '18px' }}
                                        />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    sx={{ mb: 2 }}
                    variant="fullWidth"
                >
                    <Tab label="MY VOUCHERS & REWARDS" sx={{ flex: 1 }} />
                    <Tab label="CLAIM VOUCHERS & REWARDS" sx={{ flex: 1 }} />
                </Tabs>

                {tabIndex === 0 && (
                    <Box>
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                My Vouchers & Rewards
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Search"
                                variant="outlined"
                                sx={{ mb: 2 }}
                            />
                            <Box>
                                <Button variant="outlined" sx={{ mr: 1 }}>
                                    Filter
                                </Button>
                            </Box>
                            <Grid container spacing={2}>
                                {vouchers.map((voucher, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Paper
                                            elevation={1}
                                            sx={{
                                                padding: 2,
                                                border: '1px solid',
                                                borderColor: 'grey.400'
                                            }}
                                        >
                                            <Typography variant="body1">
                                                {voucher.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                            >
                                                {voucher.value}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                )}
                {tabIndex === 1 && (
                    // Display the user's vouchers and rewards
                    <DataTable data={vouchers} columns={columns} />
                )}
            </Paper>
        </Box>
    );
};

export default MembershipTab;
