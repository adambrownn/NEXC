import { createContext, useContext, useEffect, useState } from "react";
import validator from "validator";
import { v4 as uuidv4 } from "uuid";
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
  TextField,
  FormControl,
  Select,
  MenuItem,
  CardHeader,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

import CartBucketService from "../../services/bucket";
import UserService from "../../services/user";
import { LoadingButton } from "@material-ui/lab";
import TradeDatalist from "../_external-pages/trades/TradeDatalist";
import AxiosInstance from "../../axiosConfig";
import TestFormInputs from "../TestFormInputs";
import TestCenter from "../_external-pages/forms/TestCenter";

const CartItemsContext = createContext();

function CartItems(props) {
  const { setCartItems } = useContext(CartItemsContext);
  const [newRenew, setNewRenew] = useState("new");
  const [testId, setTestId] = useState("");
  const [selectedTrade, setSelectedTrade] = useState();

  useEffect(() => {
    (async () => {
      const items = await CartBucketService.getItemsFromBucket();
      items.forEach((item) => {
        if (item._id === props._id) {
          setNewRenew(item.newRenew);
          setTestId(item.citbTestId);
          setSelectedTrade(item.trade);
        }
      });
    })();
  }, [props]);

  const handleDeleteItem = async () => {
    const newItems = await CartBucketService.removeItemFromBucket(props._id);
    setCartItems(newItems);
  };

  const handleNewRenewChange = async (e) => {
    setNewRenew(e.target.value);
    // if (e.target.value === "new") {
    const items = await CartBucketService.getItemsFromBucket();
    items.forEach((item) => {
      if (item._id === props._id) {
        item.newRenew = e.target.value;
      }
    });
    await CartBucketService.updateItems(items);
    // }
    setTestId("");
  };

  const handleSaveTestId = async () => {
    const items = await CartBucketService.getItemsFromBucket();
    items.forEach((item) => {
      if (item._id === props._id) {
        item.citbTestId = testId;
      }
    });
    await CartBucketService.updateItems(items);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        <Card sx={{ p: 3, mb: 3, position: "relative" }}>
          <Box sx={{ mb: 1, display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1">{props.title}</Typography>
          </Box>

          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                <strong>Validity: </strong> {props.validity}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                <strong>Price: </strong> £ {props.price}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            ></Stack>
            {props.type === "cards" && (
              <>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <FormControl>
                    <Select
                      size="small"
                      labelId="cards-id"
                      id="demo-simple-select"
                      name="new-renew"
                      value={newRenew || "new"}
                      onChange={handleNewRenewChange}
                    >
                      <MenuItem value={"new"}>New Card</MenuItem>
                      <MenuItem value={"renew"}>Renew Card</MenuItem>
                      <MenuItem value={"replace"}>Replace Card</MenuItem>
                    </Select>
                  </FormControl>
                  {/* SELECT TRADE  */}
                  <TradeDatalist
                    selectedTrade={selectedTrade}
                    itemId={props._id}
                  />
                </Stack>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <Grid item xs={12} md={9}>
                    <TextField
                      fullWidth
                      value={testId || ""}
                      label="Enter your CITB Testing ID (Optional)"
                      onChange={(e) => setTestId(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      onClick={handleSaveTestId}
                    >
                      Save
                    </Button>
                  </Grid>
                </Stack>
              </>
            )}
            {props?.type === "tests" && <TestFormInputs {...props} />}
          </Stack>

          <Box
            sx={{
              mb: 3,
              display: "flex",
              position: { sm: "absolute" },
              right: { sm: 4 },
              top: { sm: 24 },
            }}
          >
            <Button style={{ color: "#0003" }} onClick={handleDeleteItem}>
              <DeleteIcon /> Remove
            </Button>
            <Box sx={{ mx: 0.5 }} />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

export default function CheckoutPurchaseList(props) {
  const { setActiveStep } = useContext(props.tradeApplicationContext);
  const [cartItems, setCartItems] = useState([]);
  const [formInput, setFormInput] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [haveTestInList, setHaveTestInList] = useState(false);

  useEffect(() => {
    (async () => {
      const items = await CartBucketService.getItemsFromBucket();
      setCartItems(items || []);
      const user = await UserService.getBillingUser();
      setFormInput(user || {});

      items?.forEach((item) => {
        if (item.type === "tests") {
          setHaveTestInList(true);
        }
      });
    })();
  }, [props]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const handleSubmitForm = async () => {
    // save user to localstorage
    try {
      setIsSubmitting(true);
      if (!formInput.name || !formInput.email || !formInput.phoneNumber) {
        throw new Error("Please enter all inputs");
      } else if (!validator.isEmail(formInput?.email)) {
        throw new Error("Invalid Email!");
      } else if (
        formInput?.phoneNumber?.toString()?.length < 10 ||
        formInput?.phoneNumber?.toString()?.length > 13
      ) {
        throw new Error("Invalid Phone Number");
      }
      const checkUser = await UserService.getBillingUser();
      const saveUserReq = {
        name: formInput.name,
        email: formInput.email,
        phoneNumber: formInput.phoneNumber,
        dob: checkUser?.dob,
        NINumber: checkUser?.NINumber,
        address: checkUser?.address,
        zipcode: checkUser?.zipcode,
      };
      saveUserReq._id = checkUser?._id || uuidv4();
      // 1. create or update user
      await UserService.createUser(saveUserReq);
      const testCenter = JSON.parse(localStorage.getItem("testCenter"));
      const items = await CartBucketService.getItemsFromBucket();
      let itemsTotal = 0;
      let grandTotalToPay = 0;
      const itemsForDB = [];
      items.forEach((item) => {
        if (item.type === "tests") {
          if (!item.testDate) {
            throw new Error("Select an Test Date");
          }
          if (!item.testDate || new Date(item.testDate) < new Date()) {
            throw new Error("Select an Upcoming test date");
          }
          if (!item.testTime) {
            throw new Error("Select a time slot");
          }
          // if (!item.voiceover && !item.testModule) {
          //   if (!item.voiceover) {
          //     throw new Error("Select a VoiceOver");
          //   }
          //   if (!item.testModule) {
          //     throw new Error("Select a Module");
          //   }
          // }
          if (!testCenter) {
            throw new Error("Please select a Test Center");
          }
        }
        itemsForDB.push({
          _id: item._id,
          title: item.title,
          validity: item.validity,
          type: item.type,
          trade: item.trade || {},
          newRenew: item.newRenew || "new",
          citbTestId: item.citbTestId || "",
          quantity: 1, // TODO
          price: item.price,
        });
        itemsTotal = itemsTotal + Number(item.price);
        grandTotalToPay = grandTotalToPay + Number(item.price);
      });

      const bucketTokenResp = await UserService.getBucketToken();

      // send input to backend
      const orderReqObj = {
        customer: await UserService.getBillingUser(),
        items: itemsForDB,
        testCenter: testCenter || {},
        itemsTotal: parseFloat(itemsTotal).toFixed(2),
        grandTotalToPay: parseFloat(grandTotalToPay).toFixed(2),
      };
      if (bucketTokenResp?._id) {
        // update
        const resp = await AxiosInstance.put(
          `/orders/${bucketTokenResp._id}`,
          orderReqObj
        );
        if (resp.data.err) {
          throw new Error("Unable to Update");
        }
      } else {
        // create
        const resp = await AxiosInstance.post("/orders/create", orderReqObj);
        if (resp.data.err) {
          throw new Error("Transaction Failed");
        }
        await UserService.createBucketToken({
          _id: resp.data._id,
          orderCheckPoint: resp.data.orderCheckPoint,
          paymentStatus: resp.data.paymentStatus,
        });
      }
      setActiveStep(1);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      alert(error.message);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          {cartItems?.length > 0 ? (
            cartItems?.map((item, index) => (
              <CartItemsContext.Provider value={{ setCartItems }} key={index}>
                <CartItems key={index} {...item} />
              </CartItemsContext.Provider>
            ))
          ) : (
            <Box sx={{ maxWidth: 480, margin: "auto", textAlign: "center" }}>
              <motion.div variants={varBounceIn}>
                <Typography
                  variant="h3"
                  sx={{ color: "text.secondary" }}
                  paragraph
                >
                  Your Cart is currently empty!
                </Typography>
              </motion.div>

              <a href={"/trades"}>
                <Button
                  sx={{ mt: 4 }}
                  fullWidth
                  variant="contained"
                  size="large"
                >
                  Continue Shopping
                </Button>
              </a>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 3, m: 2 }}>
            <CardHeader title="Purchase info" sx={{ mb: 3, mt: -4 }} />
            <Stack spacing={3}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 3, sm: 2 }}
              >
                <TextField
                  fullWidth
                  label="Full Name *"
                  name="name"
                  value={formInput.name || ""}
                  onChange={handleInputChange}
                />
                <TextField
                  fullWidth
                  label="Phone Number *"
                  name="phoneNumber"
                  value={formInput.phoneNumber || ""}
                  onChange={handleInputChange}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }}>
                <TextField
                  fullWidth
                  label="Email Address *"
                  name="email"
                  value={formInput.email || ""}
                  onChange={handleInputChange}
                />
              </Stack>
            </Stack>
          </Card>

          {haveTestInList && <TestCenter />}

          {cartItems.length > 0 && (
            <LoadingButton
              sx={{ mt: 4 }}
              fullWidth
              variant="contained"
              size="large"
              loading={isSubmitting}
              onClick={handleSubmitForm}
            >
              Proceed to booking form
            </LoadingButton>
          )}
        </Grid>
      </Grid>
    </>
  );
}
