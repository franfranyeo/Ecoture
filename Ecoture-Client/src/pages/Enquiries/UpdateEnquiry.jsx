import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import http from 'utils/http';

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

// Mapping enums
const statusEnum = {
  0: 'Open',
  1: 'Closed',
  2: 'In Progress',
};

const reverseStatusEnum = {
  Open: 0,
  Closed: 1,
  'In Progress': 2,
};

function UpdateEnquiry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http
      .get(`/Enquiry/${id}`)
      .then((res) => {
        setStatus(res.data.status); // Convert to string representation
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching enquiry:', err));
  }, [id]);

  const handleUpdate = () => {
    const updatedEnquiry = { status: reverseStatusEnum[status] }; // Convert string back to numeric value
    http
      .put(`/Enquiry/${id}`, updatedEnquiry)
      .then(() => {
        alert('Status updated successfully!');
        navigate('/enquiries');
      })
      .catch((err) => console.error('Error updating enquiry:', err));
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Update Status
      </Typography>
      <FormControl fullWidth sx={{ marginBottom: '20px' }}>
        <InputLabel id="status-label">Status</InputLabel>
        <Select
          labelId="status-label"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          label="Status"
        >
          {Object.values(statusEnum).map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}
      >
        <Button
          variant="outlined"
          color="primary"
          sx={{
            textTransform: 'none',
            fontSize: '1rem',
            borderColor: 'black',
            color: 'black',
            ':hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderColor: 'black',
            },
          }}
          onClick={handleUpdate}
        >
          Update Status
        </Button>
        <Button
          type="button"
          variant="outlined"
          color="primary"
          sx={{
            textTransform: 'none',
            fontSize: '1rem',
            borderColor: 'black',
            color: 'red',
            ':hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderColor: 'black',
            },
          }}
          onClick={() => navigate('/enquiries')}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

export default UpdateEnquiry;
