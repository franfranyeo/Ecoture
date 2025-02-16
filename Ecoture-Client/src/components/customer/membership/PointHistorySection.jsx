import React, { useEffect, useState } from 'react';

import { History as HistoryIcon } from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';

import ActivityItem from './ActivityItem';

const PointHistorySection = ({
  transactions,
  totalPoints,
  fetchPointHistory,
}) => {
  useEffect(() => {
    fetchPointHistory();
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <HistoryIcon sx={{ color: '#ff4081', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          YOUR ACTIVITY
        </Typography>
      </Box>

      {/* Content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {/* Total Points */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            TOTAL: {totalPoints.toLocaleString()} POINTS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Points will expire 12 months after they were earned.
          </Typography>
        </Box>

        <Box>
          {transactions.map((transaction, index) => (
            <ActivityItem key={index} transaction={transaction} />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default PointHistorySection;
