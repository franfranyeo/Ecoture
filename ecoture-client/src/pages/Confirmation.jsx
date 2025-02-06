// Confirmation.jsx
import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

//retrival of info from local storage, help from ai to retrieve
function Confirmation() {
  const selectedAddress = JSON.parse(localStorage.getItem('selectedAddress'));
  const selectedCard = JSON.parse(localStorage.getItem('selectedCard'));
  const navigate = useNavigate();

  if (!selectedAddress || !selectedCard) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          No selection made. Please go back and select both an address and a credit card.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/choice')} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 800 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
        Confirmation
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
        {/* selected address to show */}
        <Card sx={{ width: 300, border: '1px solid gray', boxShadow: 3 }}>
          {selectedAddress.imageFile && (
            <CardMedia
              component="img"
              height="140"
              image={`${import.meta.env.VITE_FILE_BASE_URL}${selectedAddress.imageFile}`}
              alt={selectedAddress.title}
            />
          )}
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Selected Address
            </Typography>
            <Typography variant="body1">{selectedAddress.title}</Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedAddress.description}
            </Typography>
          </CardContent>
        </Card>

        {/* selected card to show */}
        <Card sx={{ width: 300, border: '1px solid gray', boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Selected Credit Card
            </Typography>
            <Typography variant="body1">{selectedCard.cardHolderName}</Typography>
            <Typography variant="body2" color="textSecondary">
              **** **** **** {selectedCard.lastFourDigits}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Expiry: {selectedCard.expiryMonth}/{selectedCard.expiryYear}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="contained" onClick={() => navigate('/choice')}>
          Back to Choice
        </Button>
      </Box>
    </Box>
  );
}

export default Confirmation;
