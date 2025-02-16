import React from 'react';

import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

const RewardsDropdown = ({
  onRewardSelect,
  userRedemptions = [],
  subtotal = 0,
  disabled = false,
}) => {
  const handleRewardSelect = (event) => {
    const redemptionId = event.target.value;
    const selectedRedemption = userRedemptions.find(
      (r) => r.redemptionId === redemptionId
    );

    if (selectedRedemption) {
      onRewardSelect(
        selectedRedemption.reward,
        selectedRedemption.redemptionId
      );
    } else {
      onRewardSelect(null, null);
    }
  };

  const calculateDiscountAmount = (reward) => {
    if (!reward) return 0;

    switch (reward.rewardType) {
      case 'Discount':
        const discountAmount = (subtotal * reward.rewardPercentage) / 100;
        return Math.min(discountAmount, reward.maximumDiscountCap || Infinity);
      case 'FreeShipping':
        return 5; // Assuming standard shipping is $5
      case 'Cashback':
        return (subtotal * reward.rewardPercentage) / 100;
      case 'Charity':
        return (subtotal * reward.rewardPercentage) / 100;
      default:
        return 0;
    }
  };

  const getRewardDescription = (reward) => {
    const amount = calculateDiscountAmount(reward);
    switch (reward.rewardType) {
      case 'Discount':
        return `${reward.rewardPercentage}% off${
          reward.maximumDiscountCap
            ? ` (max $${reward.maximumDiscountCap})`
            : ''
        }`;
      case 'FreeShipping':
        return 'Free Shipping';
      case 'Cashback':
        return `${reward.rewardPercentage}% Cashback ($${amount.toFixed(2)})`;
      case 'Charity':
        return `Donate $${amount.toFixed(2)} to ${reward.rewardTitle}`;
      default:
        return reward.rewardTitle;
    }
  };

  return (
    <Box>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Select Reward</InputLabel>
        <Select
          label="Select Reward"
          onChange={handleRewardSelect}
          defaultValue=""
          disabled={disabled}
        >
          {userRedemptions.length > 0 ? (
            userRedemptions.map((redemption) => (
              <MenuItem
                key={redemption.redemptionId}
                value={redemption.redemptionId}
              >
                {getRewardDescription(redemption.reward)}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              No rewards available
            </MenuItem>
          )}
        </Select>
      </FormControl>
      {disabled && (
        <Typography
          color="error"
          variant="caption"
          sx={{ mt: 1, display: 'block' }}
        >
          Select items in cart to apply rewards
        </Typography>
      )}
    </Box>
  );
};

export default RewardsDropdown;
