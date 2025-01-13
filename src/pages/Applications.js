import { Container, Typography } from "@material-ui/core";
import TableDataList from "../components/applications/TableDataList";
import Page from "../components/Page";

export default function Sale() {
  return (
    <Page title="Applications: Products | CSL">
      <Container maxWidth="xl" height="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Applications (Group booking, Qualification, Contact Us)
        </Typography>
        <TableDataList />
      </Container>
    </Page>
  );
}
