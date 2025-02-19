import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import RewardsDropdown from 'components/customer/rewards/RewardsDropdown';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]); // Store cart items from API
  const [selectedIndexes, setSelectedIndexes] = useState(new Set()); // Track selected items
  const [selectAll, setSelectAll] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [userRedemptions, setUserRedemptions] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedRedemptionId, setSelectedRedemptionId] = useState(null);
  const [shippingCost, setShippingCost] = useState(5);

  const fetchCart = () => {
    http
      .get('/cart')
      .then((response) => setCart(response.data))
      .catch(() => toast.error('Failed to fetch cart items.'));
  };

  const fetchRewards = () => {
    http.get('/rewards/userredemptions').then((response) => {
      setUserRedemptions(response.data);
    });
  };

  const toggleSelectItem = (index) => {
    setSelectedIndexes((prevSelected) => {
      const updatedSelection = new Set(prevSelected);
      if (updatedSelection.has(index)) {
        updatedSelection.delete(index);
      } else {
        updatedSelection.add(index);
      }
      return updatedSelection;
    });
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    let finalTotal = subtotal;
    let discountAmount = 0;

    if (selectedReward) {
      switch (selectedReward.rewardType) {
        case 'Discount':
          discountAmount = Math.min(
            (subtotal * selectedReward.rewardPercentage) / 100,
            selectedReward.maximumDiscountCap || Infinity
          );
          finalTotal -= discountAmount;
          break;
        case 'FreeShipping':
          setShippingCost(0);
          break;
        // For Cashback and Charity, we don't modify the final total
        default:
          break;
      }
    }

    return finalTotal + shippingCost;
  };

  // Add this function to calculate points
  const calculatePoints = () => {
    const finalTotal = calculateFinalTotal();
    return Math.floor(finalTotal); // 1 point per $1, rounded down
  };

  const handleRewardSelect = (reward, redemptionId) => {
    setSelectedReward(reward);
    setSelectedRedemptionId(redemptionId);
    if (reward) {
      switch (reward.rewardType) {
        case 'Discount': {
          const discountAmount = Math.min(
            (total * reward.rewardPercentage) / 100,
            reward.maximumDiscountCap || Infinity
          );
          setDiscount(discountAmount);
          toast.success(`Discount Applied: $${discountAmount.toFixed(2)} off!`);
          break;
        }
        case 'Free Shipping':
          setShippingCost(0);
          toast.success('Free Shipping Applied!');
          break;
        case 'Cashback': {
          const cashbackAmount = (total * reward.rewardPercentage) / 100;
          toast.success(
            `Cashback of $${cashbackAmount.toFixed(2)} will be credited to your account after purchase`
          );
          break;
        }
        case 'Charity':
          {
            const donationAmount = (total * reward.rewardPercentage) / 100;
            toast.success(
              `$${donationAmount.toFixed(2)} will be donated to ${reward.rewardTitle}`
            );
          }
          break;
        default:
          break;
      }
    } else {
      setDiscount(0);
      setShippingCost(5);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(cart.map((_, index) => index)));
    }
    setSelectAll(!selectAll);
  };

  const removeItem = (id) => {
    http
      .delete(`/cart/${id}`)
      .then(fetchCart)
      .catch(() => toast.error('Failed to remove item.'));
  };

  const calculateTotal = () => {
    return cart
      .filter((_, index) => selectedIndexes.has(index))
      .reduce((total, item) => total + item.price * (item.quantity || 1), 0);
  };

  const total = calculateTotal();

  const getEstimatedDelivery = () => {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    return today.toDateString();
  };

  const handleCheckout = async () => {
    if (selectedIndexes.size === 0) {
      toast.error('Please select at least one item to proceed to checkout.');
      return;
    }

    const selectedCartItems = cart.filter((_, index) =>
      selectedIndexes.has(index)
    );

    try {
      for (const item of selectedCartItems) {
        const productResponse = await http.get(`/product/${item.productId}`);
        const product = productResponse.data;

        if (!product) {
          toast.error(`Product ${item.productTitle} not found.`);
          continue;
        }

        // Reduce stock using PUT request
        await http.put(`/product/reduce-stock/${item.productId}`, {
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        });
      }

      // Proceed with order creation after stock update
      const response = await http.post('/order', selectedCartItems);
      const orderId = response.data.orderId;

      if (!orderId) {
        toast.error('Order ID is missing.');
        return;
      }

      await http.post('/user/spending', {
        amount: `${calculateTotal().toFixed(2)}`,
        points: calculatePoints(),
        redemptionId: selectedRedemptionId,
      });

      // Remove items from cart after checkout
      await Promise.all(
        selectedCartItems.map((item) => http.delete(`/cart/${item.id}`))
      );

      fetchCart();
      navigate('/choice', { state: { orderId: orderId } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order.');
    }
  };

  useEffect(() => {
    Promise.all([fetchCart(), fetchRewards()]);
  }, []);

  useEffect(() => {
    if (selectedIndexes.size === 0 || total === 0) {
      setSelectedReward(null);
      setDiscount(0);
      setShippingCost(5); // Reset shipping cost if it was changed by a free shipping reward
    }
  }, [selectedIndexes.size, total]);

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        mt: 4,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          My Cart
        </Typography>

        {cart.length === 0 ? (
          <Typography sx={{ minWidth: '500px' }}>No items in cart.</Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Checkbox checked={selectAll} onChange={toggleSelectAll} />
              <Typography>Select All</Typography>
            </Box>
            <Grid container spacing={3}>
              {cart.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <Checkbox
                      checked={selectedIndexes.has(index)}
                      onChange={() => toggleSelectItem(index)}
                    />
                    <CardMedia
                      component="img"
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        mr: 2,
                      }}
                      image={`${import.meta.env.VITE_FILE_BASE_URL}${item.imageFile}`}
                    />
                    <CardContent>
                      <Typography variant="h6">
                        {item.productTitle || 'No Title'}
                      </Typography>
                      <Typography>
                        Color: {item.color} | Size: {item.size}
                      </Typography>
                      <Typography>Quantity: {item.quantity}</Typography>
                      <Typography>
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </Typography>
                    </CardContent>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>

      <Box
        sx={{
          width: '300px',
          padding: '16px',
          boxShadow: 2,
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Order Summary
        </Typography>
        <Typography>Subtotal: ${total.toFixed(2)}</Typography>
        <Typography>Shipping: ${shippingCost.toFixed(2)}</Typography>
        {discount > 0 && (
          <Typography color="success.main">
            Discount: -${discount.toFixed(2)}
          </Typography>
        )}
        <Typography>Estimated Delivery: {getEstimatedDelivery()}</Typography>

        <Divider sx={{ marginY: 1 }} />
        <Typography variant="h6">
          Total: ${calculateFinalTotal().toFixed(2)}
        </Typography>

        <RewardsDropdown
          userRedemptions={userRedemptions}
          onRewardSelect={(reward, redemptionId) =>
            handleRewardSelect(reward, redemptionId)
          }
          subtotal={total}
          disabled={selectedIndexes.size === 0 || total === 0}
        />
        {selectedReward?.rewardType === 'Cashback' && (
          <Alert severity="info" sx={{ mt: 1 }}>
            You will receive $
            {((total * selectedReward.rewardPercentage) / 100).toFixed(2)}{' '}
            cashback
          </Alert>
        )}

        {selectedReward?.rewardType === 'Charity' && (
          <Alert severity="info" sx={{ mt: 1 }}>
            ${((total * selectedReward.rewardPercentage) / 100).toFixed(2)} will
            be donated to {selectedReward.rewardTitle}
          </Alert>
        )}

        <Alert severity="info" sx={{ mt: 1 }}>
          You will earn {calculatePoints()} points from this purchase
        </Alert>

        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          onClick={handleCheckout}
          disabled={!selectedIndexes.size}
        >
          Checkout
        </Button>
      </Box>
    </Box>
  );
}

export default Cart;
