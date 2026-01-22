import React from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';
import Page from '../components/Page';

export default function Accounts() {
  return (
    <Page title="Accounts | NEXC Construction Platform">
      <Container>
        <Typography variant="h4" gutterBottom>
          Account Management
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1">
              Account management functionality is under development.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Page>
  );
}
