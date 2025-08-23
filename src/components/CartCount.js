import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Fab from "@mui/material/Fab";
import Tooltip from "@mui/material/Tooltip";
import { Badge, Button, Dialog, DialogActions, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { useCart } from '../contexts/CartContext';
import { CheckoutPurchaseList } from './checkout';

import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  absolute: {
    position: "fixed",
    bottom: theme.spacing(12),
    right: theme.spacing(3),
  },
}));

export default function CartCount(props) {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname === '/checkout';

  const [open, setOpen] = useState(false);

  // Use cart context for consistent state management
  const { items, loadCartItems } = useCart();

  // Get cart count from context
  const cartItemCount = items?.length || 0;

  // Load cart items when component mounts or when items might have changed
  useEffect(() => {
    loadCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update both click handlers to use the same navigation pattern
  const handleBucketOpen = () => {
    navigate('/checkout');
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleProceedToCheckout = () => {
    // Close dialog first
    setOpen(false);

    // Small delay to ensure dialog closes before navigation
    setTimeout(() => {
      navigate('/checkout');
    }, 50);
  };

  return (
    <>
      {/* Only show CHECKOUT NOW button when not on checkout page */}
      {props.position === "global" && !isCheckoutPage && cartItemCount > 0 && (
        <Tooltip title="Checkout" aria-label="add">
          <span> {/* Wrapper for tooltip */}
            <Fab
              color="primary"
              className={classes.absolute}
              variant="extended"
              onClick={handleBucketOpen}
            >
              CHECKOUT NOW
              <Badge badgeContent={cartItemCount} color="secondary">
                <ShoppingCartIcon
                  style={{ marginInline: 10, transform: "scale(1.2)" }}
                />
              </Badge>
            </Fab>
          </span>
        </Tooltip>
      )}

      {props.position !== "global" && (
        <IconButton
          color="primary"
          onClick={handleOpen}
          aria-label="Shopping cart"
          sx={{ color: 'primary.main' }}
        >
          <Badge badgeContent={cartItemCount} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Your Cart</DialogTitle>
        <DialogContent>
          <CheckoutPurchaseList onNavigate={handleProceedToCheckout} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">
            Continue Shopping
          </Button>
          {cartItemCount > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* <Dialog
        open={bucketOpen}
        onClose={handleBucketClose}
        scroll={"paper"}
        fullWidth={true}
        maxWidth={"xl"}
      >
        <EcommerceCheckout />
        <DialogActions>
          <Button onClick={handleBucketClose}>Close</Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
}