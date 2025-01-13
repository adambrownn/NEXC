import { Container, Typography } from "@material-ui/core";
import TableDataList from "../components/table/TableDataList";
import Page from "../components/Page";

export default function Sale() {
  return (
    <Page title="Dashboard: Products | CSL">
      <Container maxWidth="xl" height="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Booked Orders
        </Typography>
        <TableDataList />
      </Container>
    </Page>
  );
}
