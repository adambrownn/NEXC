import { createContext, useState } from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import checkmarkFill from "@iconify/icons-eva/checkmark-fill";
// material
import {
  Box,
  Grid,
  Step,
  Stepper,
  Container,
  StepLabel,
  StepConnector,
} from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
// components
import Page from "../components/Page";
import {
  CheckoutPayment,
  CheckoutOrderComplete,
  CheckoutPurchaseList,
} from "../components/checkout";

const TradeApplicationContext = createContext();

const QontoConnector = withStyles((theme) => ({
  alternativeLabel: {
    top: 10,
    left: "calc(-50% + 20px)",
    right: "calc(50% + 20px)",
  },
  active: {
    "& $line": { borderColor: theme.palette.primary.main },
  },
  completed: {
    "& $line": { borderColor: theme.palette.primary.main },
  },
  line: {
    borderTopWidth: 2,
    borderColor: theme.palette.divider,
  },
}))(StepConnector);

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
};

function QontoStepIcon({ active, completed }) {
  return (
    <Box
      sx={{
        zIndex: 9,
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "primary.main" : "divider",
        bgcolor: "background.default",
      }}
    >
      {completed ? (
        <Box
          component={Icon}
          icon={checkmarkFill}
          sx={{ zIndex: 1, width: 20, height: 20, color: "primary.main" }}
        />
      ) : (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "currentColor",
          }}
        />
      )}
    </Box>
  );
}

export default function EcommerceCheckout(props) {
  const [activeStep, setActiveStep] = useState(0);
  const [orderId, setOrderId] = useState();
  const isComplete = activeStep > 1;

  return (
    <Page title="Checkout | CSL">
      <Container maxWidth={"xl"}>
        <Grid container justifyContent={isComplete ? "center" : "flex-start"}>
          <Grid item xs={12} md={12} sx={{ mt: 5, mb: 6 }}>
            <Stepper
              alternativeLabel
              activeStep={activeStep}
              connector={<QontoConnector />}
            >
              <Step key={"1"}>
                <StepLabel
                  StepIconComponent={QontoStepIcon}
                  sx={{
                    "& .MuiStepLabel-label": {
                      typography: "subtitle2",
                      color: "text.disabled",
                    },
                  }}
                >
                  Purchase List
                </StepLabel>
              </Step>
              <Step key={"2"}>
                <StepLabel
                  StepIconComponent={QontoStepIcon}
                  sx={{
                    "& .MuiStepLabel-label": {
                      typography: "subtitle2",
                      color: "text.disabled",
                    },
                  }}
                >
                  Checkout
                </StepLabel>
              </Step>
            </Stepper>
          </Grid>
        </Grid>

        <TradeApplicationContext.Provider value={{ setActiveStep, setOrderId }}>
          {!isComplete ? (
            <>
              {activeStep === 0 && (
                <CheckoutPurchaseList
                  tradeApplicationContext={TradeApplicationContext}
                />
              )}
              {activeStep === 1 && (
                <CheckoutPayment
                  tradeApplicationContext={TradeApplicationContext}
                />
              )}
            </>
          ) : (
            <CheckoutOrderComplete orderId={orderId} open={isComplete} />
          )}
        </TradeApplicationContext.Provider>
      </Container>
    </Page>
  );
}
