import { experimentalStyled as styled } from "@mui/material/styles";
import {
  Box,
  Grid,
  Card,
  Table,
  Divider,
  TableRow,
  Container,
  TableBody,
  TableHead,
  TableCell,
  Typography,
  TableContainer,
  CircularProgress,
} from "@mui/material";
// components
import Page from "../components/Page";
import Scrollbar from "../components/Scrollbar";
import { InvoiceToolbar } from "../components/invoice";
import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useLocation } from "react-router-dom";
import Page404 from "./Page404";
import Logo from "../components/Logo";
import { payStatus, poundSymbol } from "../utils/constant";
import AuthService from "../services/auth.service";
import PaymentOptions from "./dashboard/PaymentOptions";

const RowResultStyle = styled(TableRow)(({ theme }) => ({
  "& td": {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

const HeaderStyle = styled("header")(({ theme }) => ({
  top: 0,
  left: 0,
  lineHeight: 0,
  position: "absolute",
  padding: theme.spacing(3, 3, 0),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(5, 5, 0),
  },
}));

export default function EcommerceInvoice(props) {
  const [order, setOrder] = useState();
  const [loading, setLoading] = useState();
  const [isAdmin, setIsAdmin] = useState(false);

  const orderId = useLocation().pathname?.split("/")[3];

  useEffect(() => {
    (async () => {
      setLoading(true);
      const resp = await axiosInstance.get(`/orders/${orderId}`);
      if (!resp.data.err) {
        setOrder(resp.data);
      }
      // check if it is admin
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        const isAdminResp = await axiosInstance.get(
          `/user?userId=${currentUser.userId}&accountType=${currentUser.accountType}`
        );
        if (!isAdminResp.data?.err && isAdminResp.data?.length) {
          setIsAdmin(
            ["superadmin", "admin"].includes(isAdminResp.data[0].accountType)
          );
        }
      }
      setLoading(false);
    })();
  }, [props, orderId]);

  return (
    <Page title="Invoice | CSL">
      {order && isAdmin && (
        <Card sx={{ p: 5, px: 5, mt: 15 }}>
          <PaymentOptions {...order} />
        </Card>
      )}
      <Container sx={{ mb: 8, mt: isAdmin ? 5 : 15 }}>
        {loading ? (
          <>
            <CircularProgress />
          </>
        ) : (
          <>
            {order && Object.entries(order).length ? (
              <Card
                sx={{
                  pt: 5,
                  px: 5,
                }}
              >
                <InvoiceToolbar invoice={order} />
                <Grid
                  sx={{
                    "@media (max-width: 1200px)": {
                      display: "none",
                    },
                  }}
                >
                  <Grid container>
                    <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
                      <HeaderStyle>
                        <Logo />
                      </HeaderStyle>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
                      <Box sx={{ textAlign: { sm: "right" } }}>
                        <label
                          color="success"
                          sx={{ textTransform: "uppercase", mb: 1 }}
                        >
                          {payStatus[order.paymentStatus]}
                        </label>
                        <Typography variant="h6">INV- {order._id}</Typography>
                        <Typography variant="p">
                          Date:{" "}
                          {new Date(order?.createdAt).toLocaleDateString(
                            "en-GB"
                          )}{" "}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
                      <Typography
                        paragraph
                        variant="overline"
                        sx={{ color: "text.disabled" }}
                      >
                        Recipient
                      </Typography>
                      <Typography variant="body2">
                        {order?.customer?.name}
                      </Typography>
                      <Typography variant="body2">
                        {order?.customer?.phoneNumber &&
                          "Phone: +44 (0) " + order?.customer?.phoneNumber}
                      </Typography>
                      <Typography variant="body2">
                        {order?.customer?.email &&
                          "Email: " + order?.customer?.email}
                      </Typography>
                    </Grid>

                    {order?.customer?.address && (
                      <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
                        <Typography
                          paragraph
                          variant="overline"
                          sx={{ color: "text.disabled" }}
                        >
                          Address
                        </Typography>
                        <Typography variant="body2">
                          {order?.customer?.address}
                        </Typography>
                        <Typography variant="body2">
                          {order?.customer?.zipcode}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Scrollbar>
                    <TableContainer sx={{ minWidth: 960 }}>
                      <Table>
                        <TableHead
                          sx={{
                            borderBottom: (theme) =>
                              `solid 1px ${theme.palette.divider}`,
                            "& th": { backgroundColor: "transparent" },
                          }}
                        >
                          <TableRow>
                            <TableCell width={40}>#</TableCell>
                            <TableCell align="left">Description</TableCell>
                            <TableCell align="left">Validity</TableCell>
                            <TableCell align="left">Info</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {order.items &&
                            order?.items.map((item, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  borderBottom: (theme) =>
                                    `solid 1px ${theme.palette.divider}`,
                                }}
                              >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell align="left">
                                  <Box sx={{ maxWidth: 560 }}>
                                    <Typography variant="subtitle2">
                                      {item.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "text.secondary" }}
                                      noWrap
                                    >
                                      {item?.trade?.title &&
                                        "Trade: " + item?.trade?.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "text.secondary" }}
                                      noWrap
                                    >
                                      {item?.citbTestId &&
                                        "CITB Test ID: " + item?.citbTestId}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="left">
                                  {item?.validity}
                                </TableCell>
                                <TableCell align="left">
                                  {"QTY: " + 1} <br />
                                  {item.type === "cards" && (
                                    <>
                                      {item.newRenew?.toUpperCase()}
                                      <br />
                                    </>
                                  )}
                                  {item.type === "tests" && (
                                    <>
                                      {item.citbTestId &&
                                        "CITB ID: " + item.citbTestId}
                                      {item.testDate &&
                                        "Test Date: " +
                                          new Date(
                                            item.testDate
                                          ).toLocaleDateString("en-GB")}
                                      <br />
                                      {item.testTime &&
                                        "Time: " + item.testTime}
                                      <br />
                                      {item.voiceover &&
                                        "Voiceover: " + item.voiceover}
                                      <br />
                                      {item.testModule?.length > 0 &&
                                        "Test Modules: " +
                                          item.testModule?.toString()}
                                    </>
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {poundSymbol}
                                  {item?.price}
                                </TableCell>
                              </TableRow>
                            ))}

                          <RowResultStyle>
                            <TableCell colSpan={3} />
                            <TableCell align="right">
                              <Box sx={{ mt: 2 }} />
                              <Typography variant="body1">
                                Total Items
                              </Typography>
                            </TableCell>
                            <TableCell align="right" width={120}>
                              <Box sx={{ mt: 2 }} />
                              <Typography variant="body1">
                                {order?.items?.length || 0}
                              </Typography>
                            </TableCell>
                          </RowResultStyle>
                          <RowResultStyle>
                            <TableCell colSpan={3} />
                            <TableCell align="right">
                              <Typography variant="h6">Total</Typography>
                            </TableCell>
                            <TableCell align="right" width={140}>
                              <Typography variant="h6">
                                {poundSymbol + order.grandTotalToPay}
                              </Typography>
                            </TableCell>
                          </RowResultStyle>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Scrollbar>

                  <Divider sx={{ mt: 5 }} />

                  <Grid container>
                    <Grid item xs={12} md={9} sx={{ py: 3 }}>
                      <Typography variant="body2">
                        <Typography variant="subtitle2">
                          Company Number: 13546291
                        </Typography>
                        <Typography variant="caption">
                          Barampur, UP, 246731
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={3}
                      sx={{ py: 3, textAlign: "right" }}
                    >
                      <Typography variant="subtitle2">
                        Have a Question?
                      </Typography>
                      <Typography variant="body2">
                        support@nexc.co.uk
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            ) : (
              <Page404
                title={<h2>Order Not Found</h2>}
                description={
                  <h4>
                    We're unable to find your Order. If you think something went
                    wrong. <br />
                    Please feel free to <a href={"/contact-us"}>Contact Us.</a>
                  </h4>
                }
              />
            )}
          </>
        )}
      </Container>
    </Page>
  );
}
