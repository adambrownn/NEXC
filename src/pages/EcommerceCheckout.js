import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import checkmarkFill from "@iconify/icons-eva/checkmark-fill";
import { motion } from "framer-motion";
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
// material
import {
  Box,
  Grid,
  Step,
  Stepper,
  Container,
  StepLabel,
  StepConnector,
  Typography,
  useMediaQuery,
  Paper,
  useTheme
} from "@mui/material";
import { styled } from '@mui/material/styles';
// components
import Page from "../components/Page";
import {
  CheckoutPayment,
  CheckoutOrderComplete,
  CheckoutPurchaseList,
  CheckoutSummary,
  CheckoutServiceConfiguration,
  CheckoutCustomerDetails
} from "../components/checkout";
import { CATEGORY_COLORS } from "../components/checkout/styles";

// Create context for sharing checkout flow data between checkout components
// Note: All cart data is now managed by CartContext
export const CheckoutContext = createContext({
  activeStep: 0,
  setActiveStep: () => {},
  setOrderId: () => {},
  handleNext: () => {},
  handleBack: () => {},
  isComplete: false,
  orderId: null
});

// Custom styled step connector with animated transitions
const QontoConnector = styled(StepConnector)(({ theme }) => ({
  alternativeLabel: {
    top: 10,
    left: "calc(-50% + 20px)",
    right: "calc(50% + 20px)",
  },
  active: {
    "& $line": {
      borderColor: theme.palette.primary.main,
    },
  },
  completed: {
    "& $line": {
      borderColor: theme.palette.primary.main,
    },
  },
  line: {
    borderTopWidth: 2,
    borderColor: theme.palette.divider,
    transition: theme.transitions.create(['border-color']),
  },
}));

// Step icon component with animation
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
        transition: "all 0.2s ease-in-out",
        transform: active ? 'scale(1.2)' : 'scale(1)',
        boxShadow: active ? '0 0 0 4px rgba(0, 171, 85, 0.08)' : 'none',
      }}
    >
      {completed ? (
        <Box
          component={Icon}
          icon={checkmarkFill}
          sx={{
            zIndex: 1,
            width: 20,
            height: 20,
            color: "primary.main",
            animation: completed ? 'pulse 1s' : 'none',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(0.8)',
                opacity: 0.8,
              },
              '70%': {
                transform: 'scale(1.3)',
                opacity: 1,
              },
              '100%': {
                transform: 'scale(1)',
              },
            },
          }}
        />
      ) : (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "currentColor",
            transition: "all 0.2s",
          }}
        />
      )}
    </Box>
  );
}

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
};

// Define checkout steps with enhanced metadata
const CHECKOUT_STEPS = [
  {
    label: 'Cart Review',
    description: 'Review your selected items',
    icon: 'eva:shopping-cart-outline',
    color: CATEGORY_COLORS.default?.main || '#00AB55'
  },
  {
    label: 'Service Configuration',
    description: 'Configure your services',
    icon: 'eva:options-2-outline',
    color: CATEGORY_COLORS.tests?.main || '#2065D1'
  },
  {
    label: 'Customer Details',
    description: 'Provide your information',
    icon: 'eva:person-outline',
    color: CATEGORY_COLORS.cards?.main || '#FB6E29'
  },
  {
    label: 'Order Summary',
    description: 'Review your complete order',
    icon: 'eva:file-text-outline',
    color: CATEGORY_COLORS.courses?.main || '#7635DC'
  },
  {
    label: 'Payment',
    description: 'Complete your purchase',
    icon: 'eva:credit-card-outline',
    color: CATEGORY_COLORS.qualifications?.main || '#FF4842'
  }
];

// Animation variants for page transitions
const pageVariants = {
  initial: { opacity: 0, x: 100 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -100 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

export default function EcommerceCheckout() {
  const [activeStep, _setActiveStep] = useState(0);
  const [orderId, setOrderId] = useState();
  const [lastActiveStep, setLastActiveStep] = useState(0);
  
  // Enhanced setActiveStep function with logging and validation - wrapped in useCallback
  const setActiveStep = useCallback((step) => {
    // If step is a function (like prevStep => prevStep + 1), call it with current activeStep
    const newStep = typeof step === 'function' ? step(activeStep) : step;
    console.log(`Setting active step from ${activeStep} to ${newStep}`);
    
    // Ensure step is within valid range
    if (newStep >= 0 && newStep < CHECKOUT_STEPS.length) {
      _setActiveStep(newStep);
    } else {
      console.warn(`Attempted to set invalid step: ${newStep}`);
    }
  }, [activeStep]);

  // Use CartContext for all cart-related operations
  // We're using CartContext in child components, but not directly here
  // eslint-disable-next-line no-empty-pattern
  const {} = useCart();
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Check for step parameter in URL and set active step accordingly
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const stepParam = queryParams.get('step');
    
    if (stepParam && !isNaN(parseInt(stepParam, 10))) {
      const stepNumber = parseInt(stepParam, 10);
      // Ensure step is within valid range (0 to CHECKOUT_STEPS.length-1)
      if (stepNumber >= 0 && stepNumber < CHECKOUT_STEPS.length) {
        console.log(`Setting active step to ${stepNumber} from URL parameter`);
        setActiveStep(stepNumber);
        // Update URL to remove query parameter for cleaner UX
        navigate('/checkout', { replace: true });
      }
    }
  }, [navigate, setActiveStep]);

  // Track direction of step change for animations
  // eslint-disable-next-line no-unused-vars
  const direction = activeStep > lastActiveStep ? 1 : -1;

  // Set completion status based on active step
  const isComplete = activeStep === CHECKOUT_STEPS.length;
  const currentStep = CHECKOUT_STEPS[activeStep];

  // Update last active step when active step changes
  useEffect(() => {
    setLastActiveStep(activeStep);
  }, [activeStep]);

  // Handle moving to next step - wrapped in useCallback to prevent recreation on each render
  const handleNext = useCallback(() => {
    window.scrollTo(0, 0); // Scroll to top for better UX
    setActiveStep((prevStep) => prevStep + 1);
  }, [setActiveStep]);

  // Handle going back to previous step - wrapped in useCallback to prevent recreation on each render
  const handleBack = useCallback(() => {
    // If we're at the first step, navigate to the cart page
    if (activeStep === 0) {
      navigate('/cart');
      return;
    }
    
    // Otherwise, go to the previous step
    window.scrollTo(0, 0); // Scroll to top for better UX
    setActiveStep((prevStep) => prevStep - 1);
  }, [activeStep, navigate, setActiveStep]);

  // Note: updateCartData is now defined earlier with useCallback

  // Context value to share across checkout components - now focused only on checkout flow
  // Cart data is accessed directly from CartContext
  const checkoutContextValue = useMemo(() => ({
    activeStep,
    setActiveStep,
    setOrderId,
    orderId,
    handleNext,
    handleBack,
    isComplete: activeStep === CHECKOUT_STEPS.length
  }), [
    activeStep,
    setActiveStep,
    setOrderId,
    orderId,
    handleNext,
    handleBack
  ]);

  // Determine which component to render based on active step
  const renderStepContent = () => {
    return (
      <motion.div
        key={activeStep}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{ width: '100%' }}
      >
        {/* All components now use CartContext directly for cart data */}
        {activeStep === 0 && <CheckoutPurchaseList />}
        {activeStep === 1 && <CheckoutServiceConfiguration />}
        {activeStep === 2 && <CheckoutCustomerDetails />}
        {activeStep === 3 && <CheckoutSummary />}
        {activeStep === 4 && <CheckoutPayment />}
      </motion.div>
    );
  };

  return (
    <Page title="Checkout | NEXC">
      <CheckoutContext.Provider value={checkoutContextValue}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(240,245,255,1) 0%, rgba(255,255,255,1) 100%)',
            minHeight: '100vh',
            pt: 3,
            pb: 8
          }}
        >
        <Container maxWidth={"xl"}>
          {!isComplete && (
            <>
              <Paper
                elevation={0}
                sx={{
                  mb: 5,
                  mt: 3,
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  flexDirection: isSmallScreen ? 'column' : 'row',
                  alignItems: isSmallScreen ? 'center' : 'flex-start',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `radial-gradient(circle, ${CATEGORY_COLORS[activeStep]}15 10%, transparent 10.5%)`,
                    backgroundSize: '20px 20px',
                    opacity: 0.5,
                    zIndex: 0
                  }
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: currentStep?.color || 'primary.main',
                      textAlign: isSmallScreen ? 'center' : 'left',
                      transition: 'color 0.3s ease',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {currentStep?.label || 'Checkout'}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      textAlign: isSmallScreen ? 'center' : 'left',
                      maxWidth: '600px'
                    }}
                  >
                    {currentStep?.description}
                  </Typography>
                </Box>

                {isSmallScreen && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500
                      }}
                    >
                      Step {activeStep + 1} of {CHECKOUT_STEPS.length}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {!isSmallScreen && (
                <Grid container justifyContent="flex-start">
                  <Grid item xs={12} md={12} sx={{ mb: 5 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `radial-gradient(circle, ${CATEGORY_COLORS[activeStep]}15 10%, transparent 10.5%)`,
                        backgroundSize: '20px 20px',
                        opacity: 0.3,
                        zIndex: 0
                      }
                    }}
                  >
                    <Stepper
                      alternativeLabel
                      activeStep={activeStep}
                      connector={<QontoConnector />}
                    >
                      {CHECKOUT_STEPS.map((step, index) => (
                        <Step key={step.label}>
                          <StepLabel
                            StepIconComponent={QontoStepIcon}
                            sx={{
                              "& .MuiStepLabel-label": {
                                typography: "subtitle2",
                                color: activeStep >= index ? "text.primary" : "text.disabled",
                                fontWeight: activeStep === index ? 600 : 400,
                                transition: 'all 0.2s ease'
                              },
                            }}
                          >
                            {step.label}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Paper>
                  </Grid>
                </Grid>
              )}

              {isSmallScreen && (
                <Box sx={{ mb: 4, width: '100%' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'background.neutral',
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ width: '100%', height: 6, bgcolor: 'divider', borderRadius: 3 }}>
                      <Box
                        sx={{
                          width: `${(activeStep / (CHECKOUT_STEPS.length - 1)) * 100}%`,
                          height: '100%',
                          bgcolor: currentStep?.color || 'primary.main',
                          borderRadius: 3,
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </Box>
                  </Paper>
                </Box>
              )}
            </>
          )}

          {!isComplete ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                mb: 4
              }}
            >
              {renderStepContent()}
            </Paper>
          ) : (
            <CheckoutOrderComplete orderId={orderId} open={isComplete} />
          )}
        </Container>
        </Box>
      </CheckoutContext.Provider>
    </Page>
  );
}
