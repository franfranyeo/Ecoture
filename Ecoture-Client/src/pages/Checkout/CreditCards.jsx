import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import http from 'utils/http';

import { Edit } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';

import UserContext from '../../contexts/UserContext';

function CreditCards() {
  const [creditCardList, setCreditCardList] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const getCreditCards = () => {
    http
      .get('/creditcard')
      .then((res) => {
        setCreditCardList(res.data);
        setError(null);
      })
      .catch(() => {
        setError('Failed to fetch credit cards. Please try again later.');
      });
  };

  useEffect(() => {
    getCreditCards(); // Fetch credit cards on initial load
  }, []);

  const handleCardClick = (cardId) => {
    navigate(`/editcreditcard/${cardId}`);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}
      >
        My Credit Cards
      </Typography>

      {/* error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} justifyContent="center">
        {creditCardList.length > 0 ? (
          creditCardList.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.id}>
              <Card
                onClick={() => handleCardClick(card.id)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #ddd',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {card.cardHolderName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Card Number: **** **** **** {card.lastFourDigits}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Expiry: {card.expiryMonth}/{card.expiryYear}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      color: '#007bff',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#0056b3' },
                    }}
                  >
                    <Edit sx={{ fontSize: '1.2rem' }} />
                    <Typography variant="body2">Click to Edit</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', mt: 4 }}
          >
            No credit cards found. Add a new card to get started.
          </Typography>
        )}
      </Grid>

      {/* Buttons - Add Credit Card and Choose Information */}
      {user && (
        <Box
          sx={{
            textAlign: 'center',
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <Button
            variant="contained"
            component={Link}
            to="/addcreditcard"
            size="large"
          >
            Add Credit Card
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/choice"
            size="large"
          >
            Choose Information
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default CreditCards;
