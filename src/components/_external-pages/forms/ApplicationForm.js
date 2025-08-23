import React, { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  CardActions,
  Snackbar,
  Alert,
  Box
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CartBucketService from "../../../services/bucket";
import UserService from "../../../services/user";
import UserForm from "./UserForm";

const UserDetailsContext = createContext();

export default function ApplicationForm(props) {
  // State with better naming
  const [isInCart, setIsInCart] = useState(false);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Improved handling of cart operations with loading state and error handling
  const handleCartOperation = async () => {
    try {
      setIsLoading(true);

      // Check if user details exist first
      const user = await UserService.getBillingUser();
      if (!user) {
        // Open user form and exit early - don't proceed with cart operation yet
        setUserFormOpen(true);
        setIsLoading(false);
        return;
      }

      // Proceed with cart operation
      if (isInCart) {
        await CartBucketService.removeItemFromBucket(props._id);
        setFeedback({
          open: true,
          message: 'Item removed from cart',
          severity: 'info'
        });
      } else {
        await CartBucketService.addItemToBucket(props);
        setFeedback({
          open: true,
          message: 'Item added to cart',
          severity: 'success'
        });
      }

      setIsInCart(!isInCart);

      // Get updated cart count
      const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      navigate(`/trades?cartitems=${cartItems.length}`);
    } catch (error) {
      console.error("Cart operation failed:", error);
      setFeedback({
        open: true,
        message: 'Failed to update cart. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user form submission completion
  const handleUserFormComplete = () => {
    // After user details are saved, try the cart operation again
    handleCartOperation();
  };

  // Check if item is in cart on component mount and props change
  useEffect(() => {
    const checkCartStatus = () => {
      try {
        const itemsInCart = JSON.parse(localStorage.getItem("cart")) || [];
        const isItemInCart = itemsInCart.some(item => item._id === props._id);
        setIsInCart(isItemInCart);
      } catch (error) {
        console.error("Error checking cart status:", error);
      }
    };

    checkCartStatus();
  }, [props._id]);

  return (
    <div>
      <CardActions
        sx={{
          paddingBottom: 2.5,
          bottom: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Button
            fullWidth
            size="large"
            color={isInCart ? "success" : "primary"}
            variant={isInCart ? "contained" : "outlined"}
            onClick={handleCartOperation}
            endIcon={isInCart ? <CheckIcon /> : <AddIcon />}
            disabled={isLoading}
            sx={{
              py: 1,
              fontWeight: 600,
              borderRadius: 1.5,
              boxShadow: isInCart ? 2 : 0
            }}
          >
            {isLoading ? "Processing..." : isInCart ? "Selected" : "Add Item"}
          </Button>

          <UserDetailsContext.Provider value={{
            userFormOpen,
            setUserFormOpen,
            onComplete: handleUserFormComplete
          }}>
            <UserForm userDetailsContext={UserDetailsContext} />
          </UserDetailsContext.Provider>
        </Box>
      </CardActions>

      {/* Feedback notification */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback({ ...feedback, open: false })}
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
