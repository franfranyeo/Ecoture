import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import http from 'utils/http';

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
  Typography,
} from '@mui/material';

import UserContext from 'contexts/UserContext';

import DataTable from '../../DataTable';
import EnhancedMembership from './EnhancedMembership';

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
      toast.error('Failed to claim reward. Please try again.');
    }
  };

  const fetchRewards = async () => {
    const response = await http.get('/rewards');
    const urresponse = await http.get('/rewards/userredemptions');
    const { data } = response;
    const { data: urdata } = urresponse;
    const finalUR = urdata.map((ur) => ({ ...ur, ...ur.reward }));
    setRewards(data);
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

          // Check if reward is already claimed by looking in userRedemptions
          const isClaimed = userRedemptions.some(
            (ur) => ur.rewardId === reward.rewardId
          );

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
              disabled={isExpired || !hasEnoughPoints || !isActive || isClaimed}
              variant="contained"
              color={
                isExpired || !hasEnoughPoints || !isActive || isClaimed
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
                    : isClaimed
                      ? 'Claimed'
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
          <EnhancedMembership
            totalSpent={user.totalSpending}
            totalPoints={user.totalPoints}
          />
        </Box>

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
