import { filter } from "lodash";
import { sentenceCase } from "change-case";
import { useEffect, useState } from "react";
// material
import {
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  IconButton,
} from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";
// components
import Page from "../components/Page";
import Label from "../components/Label";
import Scrollbar from "../components/Scrollbar";
import SearchNotFound from "../components/SearchNotFound";
import {
  UserListHead,
  UserListToolbar,
  NewReservedOrder,
  OrderDetails,
} from "../components/_dashboard/reserved-orders";
import axiosInstance from "../axiosConfig";
import { orderCheckPointAr } from "src/utils/constant";

const TABLE_HEAD = [
  { id: "name", label: "Name", alignRight: false },
  { id: "email", label: "Email", alignRight: false },
  { id: "grandTotal", label: "Amount", alignRight: false },
  { id: "orderCheckPoint", label: "Order Status", alignRight: false },
  { id: "payStatus", label: "Pay Status", alignRight: true },
  { id: "createdAt", label: "Date-Time", alignRight: true },
  { id: "actions" },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function User(props) {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("name");
  const [filterName, setFilterName] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [ordersList, setOrdersList] = useState([]);

  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get("/others/reserved-orders");
      setOrdersList(resp.data || []);
    })();
  }, [props]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - ordersList.length) : 0;

  const filteredUsers = applySortFilter(
    ordersList,
    getComparator(order, orderBy),
    filterName
  );

  const isUserNotFound = filteredUsers.length === 0;

  const handleNewOrderSubmit = (data) => {
    setOrdersList([...ordersList, data]);
  };

  const handleEditOrder = async (editedOrder) => {
    let updatedList = ordersList.map((order) => {
      if (order._id === editedOrder._id) {
        return editedOrder;
      }
      return order;
    });

    setOrdersList(updatedList);
  };

  const handleDeleteOrder = async (orderId) => {
    const resp = await axiosInstance.delete(
      `/others/reserved-orders/${orderId}`
    );
    if (!resp.err) {
      const newList = ordersList.filter((order) => order._id !== orderId);
      setOrdersList(newList);
    } else {
      alert("Unable to delete");
    }
  };

  return (
    <Page title="Reserved Orders | CSL">
      <Container maxWidth="xl" height="xl">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h4" gutterBottom>
            Reserved Orders
          </Typography>
          <NewReservedOrder appendToList={handleNewOrderSubmit} />
        </Stack>

        <Card>
          <UserListToolbar
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={ordersList.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => {
                      return (
                        <TableRow
                          hover
                          key={order._id}
                          tabIndex={-1}
                          role="checkbox"
                        >
                          <TableCell padding="checkbox"></TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                            >
                              <Typography variant="subtitle2" noWrap>
                                {order.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">
                            <Typography variant="body2">
                              {order.email}
                            </Typography>
                            <Typography variant="body2">
                              {order.phoneNumber}
                            </Typography>
                          </TableCell>
                          <TableCell align="left">
                            £ {order.grandTotal}
                          </TableCell>
                          <TableCell align="left">
                            {orderCheckPointAr[order.orderCheckPoint]}
                          </TableCell>
                          <TableCell align="right">
                            <Label
                              variant="ghost"
                              color={order.payStatus ? "success" : "error"}
                            >
                              {sentenceCase(
                                order.payStatus ? "Paid" : "Unpaid"
                              )}
                            </Label>
                          </TableCell>
                          <TableCell align="right">
                            {new Date(order.createdAt)?.toLocaleString("en-GB")}
                          </TableCell>

                          <TableCell align="right">
                            <OrderDetails {...order} />

                            <NewReservedOrder
                              editOrder={handleEditOrder}
                              edit={true}
                              orderData={order}
                            />

                            <IconButton
                              onClick={() => {
                                const ifYes = window.confirm("Are you sure?");
                                if (ifYes) {
                                  handleDeleteOrder(order._id);
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={ordersList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
