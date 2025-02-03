// Choice.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import http from '../http';

function Choice() {
  const [addresses, setAddresses] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // fetching addresses and credit cards
    Promise.all([http.get('/address'), http.get('/creditcard')])
      .then(([addressRes, cardRes]) => {
        setAddresses(addressRes.data);
        setCreditCards(cardRes.data);
      })
      .catch(() => setError('Failed to load data. Please try again later.'));
  }, []);

  const handleNext = () => {
    if (selectedAddress && selectedCard) {
      // save selections to local storage*, help from ai to store in local storage
      localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
      localStorage.setItem('selectedCard', JSON.stringify(selectedCard));
      navigate('/confirmation');
    } else {
      alert('Please select both an address and a credit card.');
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 900 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
        Choose Address and Credit Card
      </Typography>

      <Grid container spacing={3}>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Addresses
          </Typography>
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <Card
                key={address.id}
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  border: selectedAddress?.id === address.id ? '2px solid blue' : '1px solid gray',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    border: '2px solid lightblue',
                  },
                }}
                onClick={() => setSelectedAddress(address)}
              >
                {address.imageFile && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={`${import.meta.env.VITE_FILE_BASE_URL}${address.imageFile}`}
                    alt={address.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {address.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {address.description}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert severity="info">No addresses available. Please add one.</Alert>
          )}
        </Grid>

        
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Credit Cards
          </Typography>
          {creditCards.length > 0 ? (
            creditCards.map((card) => (
              <Card
                key={card.id}
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  border: selectedCard?.id === card.id ? '2px solid blue' : '1px solid gray',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    border: '2px solid lightblue',
                  },
                }}
                onClick={() => setSelectedCard(card)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {card.cardHolderName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    **** **** **** {card.lastFourDigits}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Expiry: {card.expiryMonth}/{card.expiryYear}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert severity="info">No credit cards available. Please add one.</Alert>
          )}
        </Grid>
      </Grid>

      
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          disabled={!selectedAddress || !selectedCard}
        >
          Confirm
        </Button>
      </Box>
    </Box>
  );
}

export default Choice;
