import React, { useEffect, useMemo, useState } from 'react';
import http from 'utils/http';

import { AccessTime, MonetizationOn } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
  useTheme,
} from '@mui/material';

const MEMBERSHIP_TIERS = [
  { id: 1, name: 'Bronze', spendingRequired: 0 },
  { id: 2, name: 'Silver', spendingRequired: 2000 },
  { id: 3, name: 'Gold', spendingRequired: 4000 },
];

const EnhancedMembership = ({
  totalSpent = 0,
  totalPoints = 0,
  onNavigateToEarnPoints,
  onNavigateToViewActivity,
}) => {
  const [pointsExpiring, setPointsExpiring] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const theme = useTheme();
  useEffect(() => {
    // fetch points that are expiring soon for the user
    http.get('/points/expiring').then((response) => {
      const { data } = response;
      if (data.points === 0) return;
      setPointsExpiring(data.points);
      setExpiryDate(data.expiryDate);
    });
  }, []);

  const { currentTier, nextTier, progress } = useMemo(() => {
    const current = MEMBERSHIP_TIERS.find((tier, index, arr) => {
      const nextTierSpending = arr[index + 1]?.spendingRequired ?? Infinity;
      return (
        totalSpent >= tier.spendingRequired && totalSpent < nextTierSpending
      );
    });

    const nextTierIndex = MEMBERSHIP_TIERS.indexOf(current) + 1;
    const next = MEMBERSHIP_TIERS[nextTierIndex];

    const progressCalc = next
      ? ((totalSpent - current.spendingRequired) /
          (next.spendingRequired - current.spendingRequired)) *
        100
      : 100;

    return {
      currentTier: current,
      nextTier: next,
      progress: Math.min(Math.max(progressCalc, 0), 100),
    };
  }, [totalSpent]);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        You are a {currentTier.name} Member
      </Typography>

      {nextTier && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Spend ${(nextTier.spendingRequired - totalSpent).toFixed(2)} more to
          reach {nextTier.name}
        </Typography>
      )}

      {/* Progress Bar */}
      <Box sx={{ mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: 5,
            },
          }}
        />
      </Box>

      {/* Tier Labels */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {currentTier.name} (${currentTier.spendingRequired.toLocaleString()})
        </Typography>
        {nextTier && (
          <Typography variant="body2" color="text.secondary">
            {nextTier.name} (${nextTier.spendingRequired.toLocaleString()})
          </Typography>
        )}
      </Box>

      {/* Cards Grid */}
      <Grid container spacing={3}>
        {/* Points Card */}
        <Grid item xs={12} md={4}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#1a237e',
                    fontWeight: 'bold',
                  }}
                >
                  {totalPoints}
                </Typography>
                {pointsExpiring > 0 && (
                  <Typography
                    variant="body2"
                    color="warning"
                    sx={{
                      fontWeight: 'bold',
                    }}
                  >
                    {pointsExpiring} points expiring on{' '}
                    {new Date(expiryDate).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Cards */}
        <Grid item xs={12} md={4}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Card
                sx={{
                  bgcolor: '#1a237e',
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={onNavigateToViewActivity}
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
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={onNavigateToEarnPoints}
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

        {/* Benefits Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {nextTier
                  ? `Next Tier Benefits (${nextTier.name}):`
                  : 'Current Benefits:'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Increased reward points multiplier
                <br />• {nextTier
                  ? `Exclusive ${nextTier.name}`
                  : 'Current'}{' '}
                member promotions
                <br />• Priority customer support
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedMembership;
