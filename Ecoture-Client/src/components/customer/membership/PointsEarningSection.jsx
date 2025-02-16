import React, { useMemo } from 'react';

import {
  Link as LinkIcon,
  Login as LoginIcon,
  ShoppingBag as ShoppingBagIcon,
  Star as StarIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';

const EARNING_ACTIVITIES = [
  {
    id: 'daily-login',
    title: 'Daily Log-In',
    description:
      'Earn 5 points every day you log in. Visit daily to stack up rewards and unlock perks!',
    points: 5,
    icon: LoginIcon,
    iconColor: '#1a237e',
  },
  {
    id: 'shop-earn',
    title: 'Shop and Earn Points',
    description: 'Earn 1 point for every $1 you spend on eligible items.',
    points: '1 per $1',
    icon: ShoppingBagIcon,
    iconColor: '#1a237e',
  },
  {
    id: 'review',
    title: 'Leave a Review',
    description:
      "Earn 50 points for leaving a review on a product you've purchased.",
    points: 50,
    icon: StarIcon,
    iconColor: '#1a237e',
  },
  {
    id: 'refer',
    title: 'Refer Your Friends',
    description:
      'Earn 100 points when your friend signs up using your referral link.',
    points: 100,
    icon: LinkIcon,
    iconColor: '#1a237e',
  },
];

const EarningActivityCard = ({ activity, user, onEarnPoints }) => {
  const canCheckIn = useMemo(() => {
    if (activity.id !== 'daily-login') return true;
    if (!user.lastLogin) return true;

    const lastLoginDate = new Date(user.lastLogin).toLocaleDateString();
    const today = new Date().toLocaleDateString();

    return lastLoginDate !== today;
  }, [activity.id, user.lastLogin]);

  const buttonText = useMemo(() => {
    if (activity.id === 'refer') return 'Refer';
    if (activity.id === 'daily-login') {
      return canCheckIn ? 'Check in' : 'Claimed';
    }
    return 'Earn';
  }, [activity.id, canCheckIn]);

  return (
    <Card
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 2,
        boxShadow: 'none',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: '#f5f5f5',
              width: 48,
              height: 48,
            }}
          >
            <activity.icon sx={{ color: activity.iconColor }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {activity.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activity.description}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 150 }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'right', minWidth: 80 }}
          >
            Points: {activity.points}
          </Typography>
          <Button
            variant="contained"
            size="small"
            disabled={activity.id === 'daily-login' && !canCheckIn}
            onClick={() => onEarnPoints(activity.id)}
            sx={{
              bgcolor:
                activity.id === 'daily-login' && !canCheckIn
                  ? 'grey.300'
                  : '#1a237e',
              color:
                activity.id === 'daily-login' && !canCheckIn
                  ? 'text.secondary'
                  : 'white',
              '&:hover': {
                bgcolor:
                  activity.id === 'daily-login' && !canCheckIn
                    ? 'grey.300'
                    : '#000051',
              },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
                color: 'text.secondary',
              },
              minWidth: 80,
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const PointsEarningSection = ({ totalPoints, user, onEarnPoints }) => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <StarsIcon sx={{ color: '#ffd700', fontSize: 32 }} />
        <Typography variant="h5">EARN MORE POINTS</Typography>
      </Box>

      {/* Total Points */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex' }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'semibold' }}>
            TOTAL:&nbsp;
          </Typography>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            {totalPoints.toLocaleString()} POINTS
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Points will expire 12 months after they were earned.
        </Typography>
      </Box>

      {/* Earning Activities */}
      <Box>
        {EARNING_ACTIVITIES.map((activity) => (
          <EarningActivityCard
            key={activity.id}
            activity={activity}
            onEarnPoints={onEarnPoints}
            user={user}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PointsEarningSection;
