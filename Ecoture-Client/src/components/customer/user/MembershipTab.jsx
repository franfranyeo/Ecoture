import { useContext } from 'react';
import { useState } from 'react';

import { AccessTime, MonetizationOn } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import UserContext from 'contexts/UserContext';

import DataTable from '../../DataTable';
import ProgressBar from './ProgressBar';

const MembershipTab = () => {
  const { user } = useContext(UserContext);
  const [vouchers, setVouchers] = useState([
    {
      voucherCode: 'V12345',
      customerName: 'John Doe',
      rewardType: 'Discount',
      amount: '15%',
      expiryDate: '2025-06-30',
      status: 'Active',
    },
    {
      voucherCode: 'V23456',
      customerName: 'Jane Smith',
      rewardType: 'Cashback',
      amount: '$10',
      expiryDate: '2025-03-15',
      status: 'Redeemed',
    },
    {
      voucherCode: 'V34567',
      customerName: 'Alice Johnson',
      rewardType: 'Free Item',
      amount: 'Free Coffee',
      expiryDate: '2025-12-01',
      status: 'Active',
    },
    {
      voucherCode: 'V45678',
      customerName: 'Bob Williams',
      rewardType: 'Discount',
      amount: '25%',
      expiryDate: '2025-07-20',
      status: 'Expired',
    },
    {
      voucherCode: 'V56789',
      customerName: 'Charlie Brown',
      rewardType: 'Cashback',
      amount: '$20',
      expiryDate: '2025-04-10',
      status: 'Active',
    },
    {
      voucherCode: 'V67890',
      customerName: 'Diana Green',
      rewardType: 'Free Item',
      amount: 'Free Shipping',
      expiryDate: '2025-05-10',
      status: 'Active',
    },
    {
      voucherCode: 'V78901',
      customerName: 'Eve White',
      rewardType: 'Discount',
      amount: '30%',
      expiryDate: '2025-11-01',
      status: 'Redeemed',
    },
  ]);

  const columns = [
    {
      accessorKey: 'voucherCode',
      header: 'Voucher Code',
    },
    {
      accessorKey: 'customerName',
      header: 'Customer Name',
    },
    {
      accessorKey: 'rewardType',
      header: 'Reward Type',
    },
    {
      accessorKey: 'amount',
      header: 'Amount / Value',
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
  ];

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Paper elevation={2} sx={{ padding: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Membership</Typography>
        </Box>

        <Box mt={4} mb={2}>
          <Typography variant="h6">
            You are a {user.membership ? user.membership.tier : 'Bronze'} Member
          </Typography>
          <ProgressBar
            totalSpent={user.totalSpending.toFixed(2)}
            target={1000}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Typography variant="body1">
              {user.membership ? user.membership.tier : 'Bronze'}
            </Typography>
            <Typography variant="body1">Silver</Typography>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {/* Points Card */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                height: '100%',
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  TOTAL POINTS:
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#1a237e',
                    fontWeight: 'bold',
                  }}
                >
                  {user.totalPoints}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Cards */}
          <Grid item xs={12} sm={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Card
                  sx={{
                    bgcolor: '#1a237e',
                    color: 'white',
                    borderRadius: 2,
                    boxShadow: 'none',
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:last-child': { pb: 2 },
                    }}
                  >
                    <AccessTime />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      YOUR ACTIVITY
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item>
                <Card
                  sx={{
                    bgcolor: '#1a237e',
                    color: 'white',
                    borderRadius: 2,
                    boxShadow: 'none',
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:last-child': { pb: 2 },
                    }}
                  >
                    <MonetizationOn />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      EARN MORE POINTS
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          sx={{ mb: 2 }}
          variant="fullWidth"
        >
          <Tab label="MY REWARDS" sx={{ flex: 1 }} />
          <Tab label="CLAIM MORE REWARDS" sx={{ flex: 1 }} />
        </Tabs>

        {tabIndex === 0 && (
          <Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                My Rewards
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
                        borderColor: 'grey.400',
                      }}
                    >
                      <Typography variant="body1">{voucher.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
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
