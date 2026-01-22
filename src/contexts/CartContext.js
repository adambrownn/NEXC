import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import CartBucketService from '../services/bucket';
import UserService from '../services/user';
import PaymentService from '../services/payment';
import axiosInstance from '../axiosConfig';
import { prepareOrderData } from '../utils/orderHelpers';

// Create context with initial empty values, now including checkout-related state
const CartContext = createContext({
    // Cart data
    items: [],
    loading: false,
    error: null,
    totalAmount: 0,
    
    // Cart operations
    addItem: () => { },
    removeItem: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    loadCartItems: () => { },
    
    // Checkout data
    configurations: {},
    customer: {},
    billingInfo: {},
    paymentInfo: {},
    
    // Checkout operations
    updateConfigurations: () => { },
    updateCustomerInfo: () => { },
    updateBillingInfo: () => { },
    updatePaymentInfo: () => { },
    saveCustomerInfoToStorage: () => { },
    loadCustomerInfoFromStorage: () => { },
    
    // Order operations
    createOrder: () => { },
    getOrderById: () => { },
    
    // Utility functions
    getItemById: () => { },
    areAllItemsConfigured: () => { },
    
    // Operation status
    operationInProgress: false,
    operationError: null,
    resetOperationError: () => { }
});

export function CartProvider({ children }) {
    // Cart state
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Checkout state
    const [configurations, setConfigurations] = useState({});
    const [customer, setCustomer] = useState({});
    const [billingInfo, setBillingInfo] = useState({});
    const [paymentInfo, setPaymentInfo] = useState({});
    
    // Payment state
    const [clientSecret, setClientSecret] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('initial');
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    
    // Operation status
    const [operationInProgress, setOperationInProgress] = useState(false);
    const [operationError, setOperationError] = useState(null);
    
    // Memoize total amount calculation to prevent recalculation on every render
    const totalAmount = useMemo(() => {
        return items?.reduce((sum, item) => (
            sum + (Number(item.price) * (item.quantity || 1))
        ), 0) || 0;
    }, [items]);

    // Helper function to standardize operation handling
    const performOperation = useCallback(async (operationFn, errorMessage) => {
        setOperationInProgress(true);
        setOperationError(null);
        try {
            return await operationFn();
        } catch (error) {
            console.error(`${errorMessage}:`, error);
            setOperationError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setOperationInProgress(false);
        }
    }, []);
    
    // Reset operation error
    const resetOperationError = useCallback(() => {
        setOperationError(null);
    }, []);
    
    // Memoize the loadCartItems function with useCallback to prevent recreation on each render
    const loadCartItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const cartItems = await CartBucketService.getItemsFromBucket();
            setItems(cartItems || []);
            return cartItems || [];
        } catch (error) {
            console.error('Error loading cart items:', error);
            setError('Failed to load cart items');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Load cart items on component mount
    useEffect(() => {
        loadCartItems();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Cart operations - all memoized with useCallback
    const addItem = useCallback(async (item) => {
        return performOperation(async () => {
            await CartBucketService.addItemToBucket(item);
            const updatedItems = await loadCartItems();
            return { success: true, items: updatedItems };
        }, 'Failed to add item to cart');
    }, [loadCartItems, performOperation]);

    const removeItem = useCallback(async (itemId) => {
        return performOperation(async () => {
            const updatedItems = await CartBucketService.removeItemFromBucket(itemId);
            setItems(updatedItems || []);
            
            // Also remove any configurations for this item
            setConfigurations(prev => {
                const updated = { ...prev };
                delete updated[itemId];
                return updated;
            });
            
            return { success: true, items: updatedItems };
        }, 'Failed to remove item from cart');
    }, [performOperation]);

    const updateQuantity = useCallback(async (itemId, quantity) => {
        return performOperation(async () => {
            const currentItems = await CartBucketService.getItemsFromBucket();
            const updatedItems = currentItems.map(item =>
                item._id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
            );
            await CartBucketService.updateItems(updatedItems);
            setItems(updatedItems);
            return { success: true, items: updatedItems };
        }, 'Failed to update item quantity');
    }, [performOperation]);

    const clearCart = useCallback(async () => {
        return performOperation(async () => {
            await CartBucketService.clearBucket();
            setItems([]);
            
            // Also clear checkout data
            setConfigurations({});
            setCustomer({});
            setBillingInfo({});
            setPaymentInfo({});
            
            return { success: true };
        }, 'Failed to clear cart');
    }, [performOperation]);

    // Checkout operations - all memoized with useCallback
    const updateConfigurations = useCallback(async (newConfigurations) => {
        return performOperation(async () => {
            // Merge with existing configurations
            const updatedConfigurations = { ...configurations, ...newConfigurations };
            setConfigurations(updatedConfigurations);
            
            // Update items with configuration data
            const updatedItems = items.map(item => {
                if (updatedConfigurations[item._id]) {
                    return { ...item, ...updatedConfigurations[item._id] };
                }
                return item;
            });
            
            // Save to bucket service
            await CartBucketService.updateItems(updatedItems);
            setItems(updatedItems);
            
            return { success: true, configurations: updatedConfigurations };
        }, 'Failed to update service configurations');
    }, [configurations, items, performOperation]);

    const updateCustomerInfo = useCallback(async (newCustomerInfo) => {
        return performOperation(async () => {
            setCustomer(prev => ({ ...prev, ...newCustomerInfo }));
            return { success: true, customer: { ...customer, ...newCustomerInfo } };
        }, 'Failed to update customer information');
    }, [customer, performOperation]);

    const updateBillingInfo = useCallback(async (newBillingInfo) => {
        return performOperation(async () => {
            setBillingInfo(prev => ({ ...prev, ...newBillingInfo }));
            return { success: true, billingInfo: { ...billingInfo, ...newBillingInfo } };
        }, 'Failed to update billing information');
    }, [billingInfo, performOperation]);
    
    const updatePaymentInfo = useCallback(async (newPaymentInfo) => {
        return performOperation(async () => {
            setPaymentInfo(prev => ({ ...prev, ...newPaymentInfo }));
            return { success: true, paymentInfo: { ...paymentInfo, ...newPaymentInfo } };
        }, 'Failed to update payment information');
    }, [paymentInfo, performOperation]);
    
    // Save customer info to persistent storage
    const saveCustomerInfoToStorage = useCallback(async (customerData) => {
        return performOperation(async () => {
            await UserService.createUser(customerData);
            return { success: true };
        }, 'Failed to save customer information to storage');
    }, [performOperation]);
    
    // Load customer info from persistent storage
    const loadCustomerInfoFromStorage = useCallback(async () => {
        return performOperation(async () => {
            const savedUser = await UserService.getBillingUser();
            if (savedUser) {
                setCustomer(savedUser);
                return { success: true, customer: savedUser };
            }
            return { success: false, error: 'No saved customer information found' };
        }, 'Failed to load customer information from storage');
    }, [performOperation]);

    // Generic field updater for any cart-related data
    const updateCartField = useCallback(async (field, data) => {
        return performOperation(async () => {
            switch (field) {
                case 'items':
                    setItems(data);
                    return { success: true, [field]: data };
                case 'configurations':
                    setConfigurations(data);
                    return { success: true, [field]: data };
                case 'customer':
                    setCustomer(data);
                    return { success: true, [field]: data };
                case 'billingInfo':
                    setBillingInfo(data);
                    return { success: true, [field]: data };
                case 'paymentInfo':
                    setPaymentInfo(data);
                    return { success: true, [field]: data };
                default:
                    throw new Error(`Unknown field: ${field}`);
            }
        }, `Failed to update ${field}`);
    }, [performOperation]);

    // Reset checkout data but keep cart items
    const resetCheckoutData = useCallback(async () => {
        return performOperation(async () => {
            setConfigurations({});
            setCustomer({});
            setBillingInfo({});
            setPaymentInfo({});
            return { success: true };
        }, 'Failed to reset checkout data');
    }, [performOperation]);
    
    // Order operations
    const createOrder = useCallback(async (orderData) => {
        return performOperation(async () => {
            // Prepare standardized order data
            const preparedOrder = prepareOrderData({
                orderType: 'ONLINE',
                customer: customer,
                customerId: customer?._id || customer?.id,
                items: items,
                configurations: configurations,
                paymentStatus: orderData?.paymentStatus || 2, // 2 = paid (after Stripe success)
                paymentMethod: orderData?.paymentMethod || 'stripe',
                status: 'pending'
            });

            // Create order via API
            const response = await axiosInstance.post('/v1/orders', preparedOrder);
            
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.error || 'Failed to create order');
            }

            const createdOrder = response.data.order;
            
            // Clear cart after successful order
            await clearCart();
            
            return { success: true, order: createdOrder };
        }, 'Failed to create order');
    }, [items, customer, configurations, clearCart, performOperation]);
    
    const getOrderById = useCallback(async (orderId) => {
        return performOperation(async () => {
            // This would typically call an API endpoint to get an order
            // For now, we'll just simulate it with localStorage
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const order = orders.find(o => o.id === orderId);
            
            if (!order) {
                throw new Error(`Order not found: ${orderId}`);
            }
            
            return { success: true, order };
        }, 'Failed to retrieve order');
    }, [performOperation]);

    // Utility functions
    const getItemById = useCallback((itemId) => {
        return items.find(item => item._id === itemId) || null;
    }, [items]);

    // Check if all items that require configuration are properly configured
    const areAllItemsConfigured = useCallback(() => {
        // Filter items that require configuration
        const itemsRequiringConfig = items.filter(item => 
            ['tests', 'courses', 'cards', 'qualifications'].includes(item.type?.toLowerCase())
        );
        
        if (itemsRequiringConfig.length === 0) return true;
        
        // Check if all items have corresponding configurations
        return itemsRequiringConfig.every(item => {
            const config = configurations[item._id];
            if (!config) return false;
            
            // Check configuration completeness based on item type
            switch (item.type?.toLowerCase()) {
                case 'tests':
                    return config.testDetails?.testDate && 
                           config.testDetails?.testTime && 
                           config.testDetails?.testCentre;
                case 'courses':
                    return config.courseDetails?.startDate && 
                           config.courseDetails?.location && 
                           config.courseDetails?.courseType;
                case 'cards':
                    return config.cardDetails?.cardType;
                case 'qualifications':
                    return config.qualificationDetails?.level && 
                           config.qualificationDetails?.type;
                default:
                    return true;
            }
        });
    }, [items, configurations]);

    // Payment operations - all memoized with useCallback
    const createPaymentIntent = useCallback(async (amount) => {
        return performOperation(async () => {
            // Validate required data
            if (!customer || !customer.email) {
                throw new Error('Customer information is required for payment');
            }
            
            if (items.length === 0) {
                throw new Error('Cart is empty');
            }
            
            if (!amount || amount <= 0) {
                throw new Error('Invalid payment amount');
            }
            
            // Create a temporary order ID if none exists
            const orderId = paymentInfo.orderId || `temp-order-${Date.now()}`;
            
            const result = await PaymentService.createPaymentIntent({
                customerId: customer.id || customer._id,
                amount: amount,
                email: customer.email,
                orderId: orderId
            });
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to initialize payment');
            }
            
            // Update payment info with new data
            const updatedPaymentInfo = {
                ...paymentInfo,
                paymentIntentId: result.paymentIntentId,
                clientSecret: result.clientSecret,
                amount: amount,
                orderId: orderId,
                status: result.status || 'created'
            };
            
            setPaymentIntentId(result.paymentIntentId);
            setClientSecret(result.clientSecret);
            setPaymentStatus(result.status || 'created');
            setPaymentInfo(updatedPaymentInfo);
            
            return {
                success: true,
                paymentIntent: result.paymentIntent,
                clientSecret: result.clientSecret,
                paymentInfo: updatedPaymentInfo
            };
        }, 'Failed to create payment intent');
    }, [customer, items, paymentInfo, performOperation]);
    
    const confirmPayment = useCallback(async (paymentMethodId, saveCard = false) => {
        return performOperation(async () => {
            if (!paymentIntentId) {
                throw new Error('No payment intent found. Please create a payment intent first.');
            }
            
            const result = await PaymentService.confirmPayment({
                paymentIntentId,
                paymentMethodId,
                customerId: customer.id || customer._id,
                saveCard
            });
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to confirm payment');
            }
            
            // Update payment status
            setPaymentStatus(result.status || 'succeeded');
            setPaymentInfo(prev => ({
                ...prev,
                status: result.status || 'succeeded',
                paymentMethodId
            }));
            
            return {
                success: true,
                status: result.status,
                paymentMethodId
            };
        }, 'Failed to confirm payment');
    }, [customer, paymentIntentId, performOperation]);
    
    // Create a memoized value object to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        // Cart data
        items,
        loading,
        error,
        totalAmount,
        
        // Cart operations
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        loadCartItems,
        
        // Checkout data
        configurations,
        customer,
        billingInfo,
        paymentInfo,
        
        // Checkout operations
        updateConfigurations,
        updateCustomerInfo,
        updateBillingInfo,
        updatePaymentInfo,
        updateCartField,
        resetCheckoutData,
        saveCustomerInfoToStorage,
        loadCustomerInfoFromStorage,
        
        // Payment operations
        createPaymentIntent,
        confirmPayment,
        clientSecret,
        paymentStatus,
        paymentIntentId,
        
        // Order operations
        createOrder,
        getOrderById,
        
        // Utility functions
        getItemById,
        areAllItemsConfigured,
        
        // Operation status
        operationInProgress,
        operationError,
        resetOperationError
    }), [
        // Cart data
        items, loading, error, totalAmount,
        
        // Cart operations
        addItem, removeItem, updateQuantity, clearCart, loadCartItems,
        
        // Checkout data
        configurations, customer, billingInfo, paymentInfo,
        
        // Checkout operations
        updateConfigurations, updateCustomerInfo, updateBillingInfo, updatePaymentInfo,
        updateCartField, resetCheckoutData, saveCustomerInfoToStorage, loadCustomerInfoFromStorage,
        
        // Payment operations
        createPaymentIntent,
        confirmPayment,
        clientSecret,
        paymentStatus,
        paymentIntentId,
        
        // Order operations
        createOrder, getOrderById,
        
        // Utility functions
        getItemById, areAllItemsConfigured,
        
        // Operation status
        operationInProgress, operationError, resetOperationError
    ]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

// Custom hook for using cart context
export const useCart = () => useContext(CartContext);

// Export context for advanced use cases
export default CartContext;