// routes
import Router from "./routes";
// theme
import { DefaultThemeConfig } from "./theme";
// components
import ScrollToTop from "./components/ScrollToTop";
// Stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
// Cart Context
import { CartProvider } from './contexts/CartContext';

// Initialize Stripe with error handling
const getStripePromise = () => {
  try {
    return loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  } catch (error) {
    console.warn('Stripe initialization failed:', error);
    return null;
  }
};

const stripePromise = getStripePromise();

// ----------------------------------------------------------------------

export default function App() {
  return (
    <CartProvider>
      <DefaultThemeConfig>
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <ScrollToTop />
            <Router />
          </Elements>
        ) : (
          /* Fallback if Stripe fails to load */
          <>
            <ScrollToTop />
            <Router />
          </>
        )}
      </DefaultThemeConfig>
    </CartProvider>
  );
}
