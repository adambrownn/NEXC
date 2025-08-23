import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Tabs,
    Tab,
    useTheme,
    alpha
} from '@mui/material';
import {
    CreditCard as CreditCardIcon,
    Wallet as WalletIcon,
    Payments as PaymentsIcon,
    AccountBalance as BankIcon
} from '@mui/icons-material';
import PaymentIcon from '../../payment/PaymentIcon';
import {
    getPaymentMethodsByCategory,
    isPaymentMethodAvailable,
    getDeviceType
} from '../../../utils/paymentMethods';

const PaymentMethodCategory = ({ title, icon, methods, selectedMethod, onSelectMethod, context }) => {
    const theme = useTheme();

    // Filter methods by availability
    const availableMethods = methods.filter(method =>
        isPaymentMethodAvailable(method.id, context)
    );

    if (availableMethods.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary',
                fontWeight: 600
            }}>
                {icon}
                {title}
            </Typography>

            <Grid container spacing={2}>
                {availableMethods.map((method) => (
                    <Grid item xs={12} sm={6} md={4} key={method.id}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderColor: selectedMethod === method.id ? 'primary.main' : 'divider',
                                bgcolor: selectedMethod === method.id ? alpha(theme.palette.primary.light, 0.1) : 'background.paper',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: alpha(theme.palette.primary.light, 0.05),
                                },
                                transition: 'all 0.2s'
                            }}
                            onClick={() => onSelectMethod(method.id)}
                        >
                            <PaymentIcon
                                icon={method.icon}
                                name={method.name}
                                height={28}
                                spriteId={method.spriteId}
                                sx={{ mr: 1.5 }}
                            />
                            <Box>
                                <Typography variant="body2" sx={{
                                    fontWeight: selectedMethod === method.id ? 600 : 400,
                                    color: 'text.primary'
                                }}>
                                    {method.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {method.description}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

const PaymentMethodSelector = ({
    selectedMethod,
    onSelectMethod,
    amount = 0,
    country = 'GB'
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const theme = useTheme();

    // Get device type for context-aware filtering
    const deviceType = useMemo(() => getDeviceType(), []);

    // Context for payment method availability
    const context = useMemo(() => ({
        amount,
        country,
        deviceType
    }), [amount, country, deviceType]);

    // Get categorized payment methods
    const categorizedMethods = useMemo(() => {
        const categories = getPaymentMethodsByCategory();
        return {
            cards: categories.cards,
            wallets: categories.digitalWallets,
            bnpl: categories.bnpl,
            bank: categories.bankPayments
        };
    }, []);

    // Memoize the tabs array to avoid dependency issues in useEffect
    const availableTabs = useMemo(() => {
        // Determine which tabs to show based on available methods
        const hasCards = categorizedMethods.cards.some(m => isPaymentMethodAvailable(m.id, context));
        const hasWallets = categorizedMethods.wallets.some(m => isPaymentMethodAvailable(m.id, context));
        const hasBnpl = categorizedMethods.bnpl.some(m => isPaymentMethodAvailable(m.id, context));
        const hasBank = categorizedMethods.bank.some(m => isPaymentMethodAvailable(m.id, context));

        const tabs = [];
        if (hasCards) tabs.push({ index: 0, label: 'Cards', icon: <CreditCardIcon fontSize="small" /> });
        if (hasWallets) tabs.push({ index: 1, label: 'Digital Wallets', icon: <WalletIcon fontSize="small" /> });
        if (hasBnpl) tabs.push({ index: 2, label: 'Pay Later', icon: <PaymentsIcon fontSize="small" /> });
        if (hasBank) tabs.push({ index: 3, label: 'Bank', icon: <BankIcon fontSize="small" /> });

        return tabs;
    }, [categorizedMethods, context]);

    // Now use availableTabs in useEffect
    useEffect(() => {
        if (availableTabs.length > 0 && !availableTabs.some(tab => tab.index === activeTab)) {
            setActiveTab(availableTabs[0].index);
        }
    }, [availableTabs, activeTab]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                borderRadius: 2
            }}
        >
            <Typography variant="subtitle1" gutterBottom sx={{
                mb: 2,
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center'
            }}>
                <PaymentsIcon sx={{ mr: 1, fontSize: 20 }} />
                Select Payment Method
            </Typography>

            {availableTabs.length > 0 && (
                <>
                    <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                        {availableTabs.map(tab => (
                            <Tab
                                key={tab.index}
                                icon={tab.icon}
                                label={tab.label}
                                iconPosition="start"
                                value={tab.index}
                            />
                        ))}
                    </Tabs>

                    {activeTab === 0 && categorizedMethods.cards.some(m => isPaymentMethodAvailable(m.id, context)) && (
                        <PaymentMethodCategory
                            title="Credit & Debit Cards"
                            icon={<CreditCardIcon sx={{ mr: 1, fontSize: 18 }} />}
                            methods={categorizedMethods.cards}
                            selectedMethod={selectedMethod}
                            onSelectMethod={onSelectMethod}
                            context={context}
                        />
                    )}

                    {activeTab === 1 && categorizedMethods.wallets.some(m => isPaymentMethodAvailable(m.id, context)) && (
                        <PaymentMethodCategory
                            title="Digital Wallets"
                            icon={<WalletIcon sx={{ mr: 1, fontSize: 18 }} />}
                            methods={categorizedMethods.wallets}
                            selectedMethod={selectedMethod}
                            onSelectMethod={onSelectMethod}
                            context={context}
                        />
                    )}

                    {activeTab === 2 && categorizedMethods.bnpl.some(m => isPaymentMethodAvailable(m.id, context)) && (
                        <PaymentMethodCategory
                            title="Buy Now, Pay Later"
                            icon={<PaymentsIcon sx={{ mr: 1, fontSize: 18 }} />}
                            methods={categorizedMethods.bnpl}
                            selectedMethod={selectedMethod}
                            onSelectMethod={onSelectMethod}
                            context={context}
                        />
                    )}

                    {activeTab === 3 && categorizedMethods.bank.some(m => isPaymentMethodAvailable(m.id, context)) && (
                        <PaymentMethodCategory
                            title="Bank Payments"
                            icon={<BankIcon sx={{ mr: 1, fontSize: 18 }} />}
                            methods={categorizedMethods.bank}
                            selectedMethod={selectedMethod}
                            onSelectMethod={onSelectMethod}
                            context={context}
                        />
                    )}
                </>
            )}

            {availableTabs.length === 0 && (
                <Typography color="error">
                    No payment methods available for the current amount and device.
                </Typography>
            )}
        </Paper>
    );
};

PaymentMethodSelector.propTypes = {
    selectedMethod: PropTypes.string,
    onSelectMethod: PropTypes.func.isRequired,
    amount: PropTypes.number,
    country: PropTypes.string
};

PaymentMethodCategory.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node,
    methods: PropTypes.array.isRequired,
    selectedMethod: PropTypes.string,
    onSelectMethod: PropTypes.func.isRequired,
    context: PropTypes.object
};

export default PaymentMethodSelector;