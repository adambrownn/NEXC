import { Container, Typography } from "@mui/material";
import TableDataList from "../components/accounts/TableDataList";
import Page from "../components/Page";

export default function Accounts() {
  return (
    <Page title="Accounts | CSL">
      <Container maxWidth="xl" height="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Accounts (Users, Admin, Visitors)
        </Typography>
        <TableDataList />
      </Container>
    </Page>
  );
}
