import { useContext, useEffect, useState, createContext } from "react";
import { Icon } from "@iconify/react";
import arrowIosBackFill from "@iconify/icons-eva/arrow-ios-back-fill";
import { enGB } from "date-fns/locale";
// material
import {
  Grid,
  Button,
  Card,
  Stack,
  TextField,
  CardHeader,
  Typography,
  CardContent,
  Checkbox,
  FormControlLabel,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";
import { LoadingButton } from "@material-ui/lab";
import DatePicker from "@mui/lab/DatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import valid from "card-validator";

import CheckoutSummary from "./CheckoutSummary";
import CheckoutPaymentMethods from "./CheckoutPaymentMethods";

import UserService from "../../services/user";
import CartBucketService from "../../services/bucket";
import AxiosInstance from "../../axiosConfig";

const PaymentDetailContext = createContext();

const PAYMENT_OPTIONS = [
  {
    value: "credit_card",
    title: "Credit / Debit Card",
    description: "We support Mastercard, Visa, JCB and Diners Club.",
    icons: [
      { logo: "logos:visa", fontSize: 14 },
      { logo: "logos:mastercard", fontSize: 24 },
      { logo: "logos:jcb", fontSize: 26 },
      { logo: "cib:cc-diners-club", fontSize: 30 },
    ],
    disabled: false,
  },
  // {
  //   value: "paylater",
  //   title: "Pay later",
  //   description: "Our executive will connect you for the Payment details",
  //   icons: [],
  //   disabled: false,
  // },
];

export default function CheckoutPayment(props) {
  const { setActiveStep, setOrderId } = useContext(
    props.tradeApplicationContext
  );
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(true);
  const [dob, setDob] = useState("");
  const [orderSummary, setOrderSummary] = useState({});
  const [formInput, setFormInput] = useState({
    paymentMode: "credit_card",
  });
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    (async () => {
      const user = await UserService.getBillingUser();
      setCurrentUser(user);
      setFormInput(user);
      setDob(user.dob || "");

      // orders summary
      const items = await CartBucketService.getItemsFromBucket();
      let itemsTotal = 0;
      let grandTotalToPay = 0;
      items?.forEach((item) => {
        itemsTotal = itemsTotal + Number(item.price);

        grandTotalToPay = grandTotalToPay + Number(item.price);
      });
      const orderReqObj = {
        items: items,
        itemsTotal: parseFloat(itemsTotal).toFixed(2),
        grandTotalToPay: parseFloat(grandTotalToPay).toFixed(2),
      };
      setOrderSummary(orderReqObj);
    })();
  }, [props]);

  const handleCompleteOrder = async () => {
    try {
      formInput.paymentMode = "credit_card";
      if (!formInput.paymentMode) {
        throw new Error("Please select a payment mode");
      }
      if (!isTermsAccepted) {
        throw new Error("Please accept Terms & Conditions before continue");
      }
      if (
        Object.entries(currentUser).length < 3 ||
        !dob ||
        !formInput.NINumber ||
        !formInput.address ||
        !formInput.zipcode
      ) {
        throw new Error("All input required");
      }

      const saveUserReq = {
        name: currentUser.name,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        dob: dob,
        NINumber: formInput.NINumber,
        address: formInput.address,
        zipcode: formInput.zipcode,
      };
      // update billing user
      await UserService.createUser(saveUserReq);

      // update bucket token
      const bucketToken = await UserService.getBucketToken();

      // save details to backend first
      await AxiosInstance.put(`/orders/${bucketToken._id}`, {
        customer: saveUserReq,
      });

      if (formInput.paymentMode === "credit_card") {
        if (
          !formInput.cardholderName ||
          !formInput.cardNumber ||
          !formInput.month ||
          !formInput.year ||
          !formInput.securityCode
        ) {
          throw new Error("Please enter all Card fields");
        }
        if (
          formInput.cardholderName?.length > 45 ||
          formInput.cardNumber?.length > 16
        ) {
          throw new Error("Invalid Card input");
        }
      }

      const confirmReturn = window.confirm(
        "Are you sure, You want to Proceed?"
      );

      if (confirmReturn) {
        setOpenBackdrop(true);
        // update req
        const updateReq = {
          paymentMethod: formInput.paymentMode,
          paymentStatus: 1,
          orderCheckPoint: 3,
          customer: saveUserReq,
          orderDetails: orderSummary,
        };

        if (formInput.paymentMode === "credit_card") {
          updateReq.cardInfo = {
            cardholderName: formInput.cardholderName,
            cardNumber: formInput.cardNumber,
            expiryDate:
              formInput.month + formInput.year.toString().substring(2, 4),
            securityCode: formInput.securityCode,
          };
          const numberValidation = valid.number(formInput.cardNumber);
          if (!numberValidation.isPotentiallyValid) {
            throw new Error("Please enter valid Card details!");
          }
        }

        // update in db
        const resp = await AxiosInstance.put(
          `/orders/payment/${bucketToken._id}`,
          updateReq
        );
        setOpenBackdrop(false);
        if (resp.data.err) {
          throw new Error("Transaction Failed, Please try again.");
        }
        if (resp.data.paymentStatus === 2) {
          setOrderId(resp.data?._id);
          localStorage.removeItem("cart");
          localStorage.removeItem("buckettoken");
          localStorage.removeItem("testCenter");
          setActiveStep(3);
        }
      }
    } catch (error) {
      setOpenBackdrop(false);
      alert(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <CardHeader title="Purchase Details" sx={{ marginBottom: 3 }} />
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
                <DatePicker
                  label="Date of Birth"
                  name="dob"
                  value={dob}
                  onChange={(newValue) => {
                    setDob(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <TextField
                fullWidth
                label="NI Number"
                name="NINumber"
                value={formInput.NINumber || ""}
                onChange={handleInputChange}
              />
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formInput.address || ""}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Postcode"
                name="zipcode"
                value={formInput.zipcode || ""}
                onChange={handleInputChange}
              />
            </Stack>
          </Stack>
        </Card>

        <CheckoutPaymentMethods
          formInput={formInput}
          handleInputChange={handleInputChange}
          paymentOptions={PAYMENT_OPTIONS}
          paymentContext={PaymentDetailContext}
        />

        <Button
          type="button"
          size="small"
          color="inherit"
          onClick={() => setActiveStep(0)}
          startIcon={<Icon icon={arrowIosBackFill} />}
        >
          Back
        </Button>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Billing Info" />
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              <Typography component="span" variant="h6">
                {currentUser.name}
              </Typography>
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "text.secondary" }}
              gutterBottom
            >
              {currentUser.phoneNumber}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {currentUser.email}
            </Typography>
          </CardContent>
        </Card>
        <CheckoutSummary
          enableEdit
          totalItems={orderSummary?.items?.length || "NA"}
          itemsTotal={orderSummary?.itemsTotal || "NA"}
          grandTotal={orderSummary?.grandTotalToPay || "NA"}
        />
        <FormControlLabel
          size="small"
          onChange={() => setIsTermsAccepted(!isTermsAccepted)}
          control={<Checkbox checked={isTermsAccepted} name="tandc" />}
          label={
            <Typography variant="caption">
              I understand and agree to{" "}
              <a href="/terms-condition" target="_blank">
                Terms and Conditions
              </a>
            </Typography>
          }
        />
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          onClick={handleCompleteOrder}
          loading={false}
        >
          Confirm {"&"} Checkout
        </LoadingButton>
        <br />
        <br />
        <Typography variant="subtitle2">Company Number: 13546291</Typography>
        <Typography variant="caption">
          71 - 75, Shelton Street, <br /> Covent Garden London WC2H 9JQ UNITED
          KINGDOM
        </Typography>
      </Grid>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Grid>
  );
}
