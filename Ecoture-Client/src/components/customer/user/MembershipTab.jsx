import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import http from 'utils/http';

import { AccessTime, MonetizationOn } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
  Typography,
} from '@mui/material';

import UserContext from 'contexts/UserContext';

import DataTable from '../../DataTable';
import ProgressBar from './ProgressBar';

const MembershipTab = () => {
  const { user } = useContext(UserContext);
  const [rewards, setRewards] = useState([]);
  const [userRedemptions, setUserRedemptions] = useState([]);

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const claimReward = async (rewardId) => {
    // Add your API call or claim logic here
    try {
      await http.post(`rewards/claim/${rewardId}`);
      toast.success('Reward claimed successfully!');
      fetchRewards();
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  const fetchRewards = async () => {
    const response = await http.get('/rewards');
    const urresponse = await http.get('/rewards/userredemptions');
    const { data } = response;
    const { data: urdata } = urresponse;
    const finalUR = urdata.map((ur) => ({ ...ur, ...ur.reward }));
    setRewards(data);
    console.log(finalUR);
    setUserRedemptions(finalUR);
  };

  const generateColumns = (data, isUserRedemptions = false) => {
    if (!data || data.length === 0) return [];

    // Define the relevant keys for rewards and user redemptions
    const rewardKeys = [
      'rewardTitle',
      'rewardDescription',
      'rewardType', // Added for filtering
      'loyaltyPointsRequired',
      'expirationDate',
      'status',
    ];

    const userRedemptionKeys = [
      'rewardTitle',
      'rewardDescription',
      'rewardType', // Added for filtering
      'redemptionDate',
      'status',
    ];

    // Use the appropriate keys based on the data type
    const relevantKeys = isUserRedemptions ? userRedemptionKeys : rewardKeys;

    // Custom header labels for better readability
    const headerMapping = {
      rewardTitle: 'Reward',
      rewardDescription: 'Description',
      rewardType: 'Type', // Added for filtering
      loyaltyPointsRequired: 'Points Required',
      expirationDate: 'Expiration Date',
      status: 'Status',
      redemptionDate: 'Claimed At',
    };

    // Create base columns for relevant keys
    const baseColumns = relevantKeys.map((key) => ({
      accessorKey: key,
      header: headerMapping[key],
      cell: ({ row }) => {
        const value = row.original[key];

        // Format dates
        if (key === 'expirationDate' || key === 'redemptionDate') {
          return value ? new Date(value).toLocaleDateString() : '-';
        }

        // Format loyalty points
        if (key === 'loyaltyPointsRequired') {
          return value !== null && value !== undefined ? value : '0';
        }

        // Handle null or undefined values
        if (value === null || value === undefined) {
          return '-';
        }

        return value;
      },
    }));

    // Add action column for rewards (not for user redemptions)
    if (!isUserRedemptions) {
      const actionColumn = {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const reward = row.original;
          const isExpired = new Date(reward.expirationDate) < new Date();
          const hasEnoughPoints =
            reward.loyaltyPointsRequired === null ||
            user.totalPoints >= reward.loyaltyPointsRequired;
          const isActive = reward.status === 'Active';

          const handleClaim = async () => {
            try {
              await claimReward(reward.rewardId);
            } catch (error) {
              console.error('Failed to claim reward:', error);
            }
          };

          return (
            <Button
              onClick={handleClaim}
              disabled={isExpired || !hasEnoughPoints || !isActive}
              variant="contained"
              color={
                isExpired || !hasEnoughPoints || !isActive
                  ? 'inherit'
                  : 'primary'
              }
              size="small"
            >
              {isExpired
                ? 'Expired'
                : !hasEnoughPoints
                  ? 'Insufficient Points'
                  : !isActive
                    ? 'Inactive'
                    : 'Claim'}
            </Button>
          );
        },
      };

      // Return all columns including the action column
      return [...baseColumns, actionColumn];
    }

    // Return only base columns for user redemptions
    return baseColumns;
  };

  // Generate columns dynamically
  const columns = generateColumns(rewards);

  useEffect(() => {
    try {
      fetchRewards();
    } catch (error) {
      console.error(error);
    }
  }, []);

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
          <DataTable
            data={userRedemptions}
            columns={generateColumns(userRedemptions, true)}
            searchKeys={['rewardTitle', 'rewardDescription']}
            filterOptions={{
              key: 'rewardType',
              values: ['All', 'Discount', 'Free Shipping', 'Cashback'],
            }}
            sortOptions={['Default', 'Newest', 'Oldest', 'Alphabetical']}
          />
        )}
        {tabIndex === 1 && (
          // Display the user's vouchers and rewards
          <DataTable
            data={rewards}
            columns={columns}
            searchKeys={['rewardTitle', 'rewardDescription']} // Specify searchable keys
            filterOptions={{
              key: 'rewardType',
              values: ['All', 'Discount', 'Free Shipping', 'Cashback'],
            }}
            sortOptions={['Default', 'Newest', 'Oldest', 'Alphabetical']}
          />
        )}
      </Paper>
    </Box>
  );
};

export default MembershipTab;
