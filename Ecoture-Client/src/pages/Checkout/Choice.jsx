import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import http from 'utils/http';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';

import UserContext from 'contexts/UserContext';

function Choice() {
  const [addresses, setAddresses] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { state } = useLocation();

  useEffect(() => {
    // Fetching addresses and credit cards
    Promise.all([http.get('/address'), http.get('/creditcard')])
      .then(([addressRes, cardRes]) => {
        setAddresses(addressRes.data);
        setCreditCards(cardRes.data);
      })
      .catch(() => setError('Failed to load data. Please try again later.'));
  }, []);

  const handleNext = () => {
    if (selectedAddress && selectedCard) {
      const orderConfirmationRequest = {
        userId: user.userId, // ✅ Pass the logged-in user ID
        orderId: state.orderId, // ✅ Pass the latest order ID
      };
      http
        .post('/order/confirm', orderConfirmationRequest)
        .then(() => {
          navigate(`/confirmation`, { state: state });
        })
        .catch((error) => {
          console.error('Error confirming order:', error);
          alert('Failed to confirm order.');
        });
    } else {
      alert('Please select both an address and a credit card.');
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 900 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}
      >
        Choose Address and Credit Card
      </Typography>

      <Grid container spacing={3}>
        {/* Addresses Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Addresses
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/addaddress"
              size="small"
            >
              Add Address
            </Button>
          </Box>

          {addresses.length > 0 ? (
            addresses.map((address) => (
              <Card
                key={address.id}
                sx={{
                  mb: 2,
                  position: 'relative',
                  cursor: 'pointer',
                  border:
                    selectedAddress?.id === address.id
                      ? '2px solid blue'
                      : '1px solid gray',
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
                    image={`${import.meta.env.VITE_FILE_BASE_URL}${
                      address.imageFile
                    }`}
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

                {/* Edit Icon */}
                <IconButton
                  component={Link}
                  to={`/editaddress/${address.id}`}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: 'lightgray' },
                  }}
                >
                  <Typography>Edit</Typography>
                </IconButton>
              </Card>
            ))
          ) : (
            <Alert severity="info">
              No addresses available. Please add one.
            </Alert>
          )}
        </Grid>

        {/* Credit Cards Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Credit Cards
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/addcreditcard"
              size="small"
            >
              Add Credit Card
            </Button>
          </Box>

          {creditCards.length > 0 ? (
            creditCards.map((card) => (
              <Card
                key={card.id}
                sx={{
                  mb: 2,
                  position: 'relative',
                  cursor: 'pointer',
                  border:
                    selectedCard?.id === card.id
                      ? '2px solid blue'
                      : '1px solid gray',
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

                {/* Edit Icon */}
                <IconButton
                  component={Link}
                  to={`/editcreditcard/${card.id}`}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: 'lightgray' },
                  }}
                >
                  <Typography>Edit</Typography>
                </IconButton>
              </Card>
            ))
          ) : (
            <Alert severity="info">
              No credit cards available. Please add one.
            </Alert>
          )}
        </Grid>
      </Grid>

      {/* Confirm Button */}
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
