import {
  Add as AddIcon,
  CardGiftcard as GiftIcon,
  History as HistoryIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

const ActivityItem = ({ transaction }) => {
  const isPositive = transaction.pointsEarned > 0;
  const isGift = transaction.transactionType.toLowerCase() === 'welcome gift';

  const getIcon = () => {
    if (isGift) return <GiftIcon sx={{ color: '#fff' }} />;
    return isPositive ? (
      <AddIcon sx={{ color: '#fff' }} />
    ) : (
      <RemoveIcon sx={{ color: '#fff' }} />
    );
  };

  const getBackgroundColor = () => {
    if (isGift) return '#90caf9'; // Light blue for gifts
    return isPositive ? '#4caf50' : '#f44336'; // Green for earned, red for spent
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
  };

  const formatPoints = () => {
    if (transaction.pointsEarned > 0) {
      return `+${transaction.pointsEarned} points`;
    }
    return `-${transaction.pointsSpent} points`;
  };

  return (
    <Box sx={{ display: 'flex', mb: 3, position: 'relative' }}>
      {/* Timeline line */}
      <Box
        sx={{
          position: 'absolute',
          left: '20px',
          top: '40px',
          bottom: '-20px',
          width: '2px',
          bgcolor: 'grey.200',
          zIndex: 0,
        }}
      />

      {/* Icon circle */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: getBackgroundColor(),
          zIndex: 1,
          mr: 2,
        }}
      >
        {getIcon()}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
          {transaction.transactionType}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(transaction.createdAt)}
        </Typography>
      </Box>

      {/* Points */}
      <Typography
        variant="body1"
        sx={{
          color: isPositive ? 'success.main' : 'error.main',
          fontWeight: 500,
        }}
      >
        {formatPoints()}
      </Typography>
    </Box>
  );
};

export default ActivityItem;
