import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart";
import Fab from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import { Badge, Button, Dialog, DialogActions } from "@material-ui/core";
import CartBucketService from "../services/bucket";
import EcommerceCheckout from "../pages/EcommerceCheckout";

import { makeStyles } from "@material-ui/styles";

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

  const [bucketOpen, setBucketOpen] = useState(false);
  const [itemsCount, setItemsCount] = useState(0);

  let search = window.location.search;
  let params = new URLSearchParams(search);
  let cartItemsCount = params.get("cartitems");

  useEffect(() => {
    (async () => {
      const count = await CartBucketService.getItemsCount();
      setItemsCount(count || 0);
    })();
  }, [cartItemsCount]);

  const handleBucketOpen = () => {
    setBucketOpen(true);
  };

  const handleBucketClose = () => {
    setBucketOpen(false);

    navigate(`/trades?cartitems=${0}`);
  };

  return (
    <>
      {itemsCount > 0 ? (
        props.position === "global" ? (
          <Tooltip title="Checkout" aria-label="add">
            <Fab
              color="primary"
              className={classes.absolute}
              variant="extended"
              onClick={handleBucketOpen}
            >
              CHECKOUT NOW
              <Badge badgeContent={itemsCount} color="secondary">
                <ShoppingCartIcon
                  style={{ marginInline: 10, transform: "scale(1.2)" }}
                />
              </Badge>
            </Fab>
          </Tooltip>
        ) : (
          <Button
            sx={{
              marginLeft: 4,
              transform: "scale(1.3)",
            }}
            onClick={handleBucketOpen}
          >
            <Badge badgeContent={itemsCount} color="secondary">
              <ShoppingCartIcon
                style={{ marginInline: 10, transform: "scale(1.2)" }}
              />
            </Badge>
          </Button>
        )
      ) : (
        props.position !== "global" && (
          <Button
            sx={{
              marginLeft: 4,
              transform: "scale(1.3)",
            }}
            onClick={handleBucketOpen}
          >
            <AddShoppingCartIcon />
          </Button>
        )
      )}

      <Dialog
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
      </Dialog>
    </>
  );
}
