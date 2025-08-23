import React from 'react';
import EcommerceCheckout from './EcommerceCheckout';
import { Box, Container } from '@mui/material';
import Page from '../components/Page';

export default function Checkout() {
  return (
    <Page title="Checkout | NEXC">
      <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="xl">
          <EcommerceCheckout />
        </Container>
      </Box>
    </Page>
  );
}
