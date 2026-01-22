// routes
import Router from "./routes";
// theme
import { DefaultThemeConfig } from "./theme";
// components
import ScrollToTop from "./components/ScrollToTop";
// Stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
// Context Providers
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import FloatingCallWidget from './components/voice/FloatingCallWidget';

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
    <AuthProvider>
      <SettingsProvider>
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
            <FloatingCallWidget />
          </DefaultThemeConfig>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
