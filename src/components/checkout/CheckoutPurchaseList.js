import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { varBounceIn } from "../../components/animate";
// material
import {
  Box,
  Grid,
  Card,
  Button,
  Typography,
  Stack,
  Divider,
  IconButton,
  CardHeader,
  Alert,
  AlertTitle,
  CircularProgress
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from "@mui/lab";
// Import our cart context hook
import { useCart } from "../../contexts/CartContext";

// Import checkout context
import { CheckoutContext } from "../../pages/EcommerceCheckout";

// CartItem component using CartContext directly
function CartItem(props) {
  // Use global cart context for all operations
  const { updateQuantity, removeItem } = useCart();
  const [quantity, setQuantity] = useState(props.quantity || 1);
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle quantity change
  const handleQuantityChange = async (change) => {
    try {
      setIsUpdating(true);
      const newQuantity = Math.max(1, quantity + change);
      setQuantity(newQuantity);
      await updateQuantity(props._id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle item deletion
  const handleDeleteItem = async () => {
    try {
      setIsUpdating(true);
      await removeItem(props._id);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card sx={{ p: 3, mb: 3, position: "relative" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>{props.title}</Typography>

          <Stack direction="row" spacing={3}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <strong>Type:</strong> {props.type.charAt(0).toUpperCase() + props.type.slice(1)}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <strong>Validity:</strong> {props.validity}
            </Typography>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
            £{props.price}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>

          <Typography sx={{ mx: 2 }}>{quantity}</Typography>

          <IconButton
            size="small"
            onClick={() => handleQuantityChange(1)}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        <Button
          startIcon={<DeleteIcon />}
          color="error"
          onClick={handleDeleteItem}
        >
          Remove
        </Button>
      </Stack>

      {props.serviceConfiguration && (
        <Alert 
          severity="info" 
          sx={{ 
            mt: 2,
            '& .MuiAlert-icon': {
              color: theme => theme.palette.info.main
            }
          }}
          icon={<SettingsIcon />}
        >
          <AlertTitle>Service Configuration Required</AlertTitle>
          This item requires additional configuration in the next step.
        </Alert>
      )}
      
      {isUpdating && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Card>
  );
}

export default function CheckoutPurchaseList({ onNavigate }) {
  // Use global cart context for all cart data and operations
  const { items, loading, totalAmount, loadCartItems } = useCart();
  const navigate = useNavigate();

  // Get checkout context for navigation between steps
  const { handleNext } = useContext(CheckoutContext);

  // Fetch cart items on component mount
  useEffect(() => {
    loadCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Continue to next step
  const handleContinue = () => {
    if (items.length === 0) {
      alert('Your cart is empty. Please add items before proceeding.');
      return;
    }

    if (handleNext) {
      // We're in the checkout flow, advance to next step
      handleNext();
    } else {
      // Not in checkout flow, navigate to checkout
      // If onNavigate prop is provided (from dialog), use it to close dialog before navigation
      if (onNavigate) {
        onNavigate();
      } else {
        navigate('/checkout');
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Typography variant="h6" sx={{ mb: 2 }}>Your Cart Items</Typography>

        {loading ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography>Loading your cart...</Typography>
          </Box>
        ) : items?.length > 0 ? (
          <>
            {items.map((item, index) => (
              <CartItem key={item._id || index} {...item} />
            ))}
          </>
        ) : (
          <Box sx={{ maxWidth: 480, margin: "auto", textAlign: "center", py: 5 }}>
            <motion.div variants={varBounceIn}>
              <Typography variant="h5" sx={{ color: "text.secondary" }} paragraph>
                Your Cart is Empty
              </Typography>
            </motion.div>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Add some items to your cart to continue with checkout.
            </Typography>

            <Button
              variant="contained"
              size="large"
              component="a"
              href="/trades"
            >
              Browse Services
            </Button>
          </Box>
        )}
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3 }}>
          <CardHeader title="Order Summary" />

          <Stack spacing={2} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Items ({items.length})
              </Typography>
              <Typography variant="subtitle2">
                £{totalAmount.toFixed(2)}
              </Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle1">Total</Typography>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="subtitle1" sx={{ color: "primary.main", fontWeight: 'bold' }}>
                  £{totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                  (VAT included if applicable)
                </Typography>
              </Box>
            </Stack>

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={loading}
              disabled={items.length === 0}
              onClick={handleContinue}
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 2 }}
            >
              {handleNext ? 'Configure Services' : 'Proceed to Checkout'}
            </LoadingButton>

            <Button
              fullWidth
              component="a"
              href="/trades"
              size="large"
            >
              Add More Services
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
