import { filter } from "lodash";
import { useEffect, useState } from "react";
// material
import {
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
  TablePagination,
  IconButton,
} from "@material-ui/core";
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@material-ui/icons";
// components
import Page from "../Page";
import Label from "../Label";
import Scrollbar from "../Scrollbar";
import SearchNotFound from "../SearchNotFound";
import { TableHeadData, FilterTable } from "./index";
import axiosInstance from "../../axiosConfig";
import { payStatus, payStatusColor } from "../../utils/constant";

const TABLE_HEAD = [
  { id: "name", label: "Name", alignRight: false },
  { id: "email", label: "Email", alignRight: false },
  { id: "phoneNumber", label: "Contact", alignRight: false },
  { id: "grandTotalToPay", label: "Amount", alignRight: false },
  { id: "paymentStatus", label: "Pay Status", alignRight: true },
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
  if (["name", "email", "phoneNumber"].includes(orderBy)) {
    return order === "desc"
      ? (a, b) => descendingComparator(a.customer, b.customer, orderBy)
      : (a, b) => -descendingComparator(a.customer, b.customer, orderBy);
  } else {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
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
      (_order) =>
        _order.customer.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function TableDataList(props) {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("name");
  const [filterName, setFilterName] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [ordersList, setOrdersList] = useState([]);

  const getOrders = async () => {
    const resp = await axiosInstance.get("/orders");
    setOrdersList(resp.data || []);
  };

  useEffect(() => {
    getOrders();
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

  const handleDeleteOrder = async (orderId) => {
    const resp = await axiosInstance.delete(`/orders/${orderId}`);
    if (!resp.err) {
      const newList = ordersList.filter((order) => order._id !== orderId);
      setOrdersList(newList);
    } else {
      alert("Unable to delete");
    }
  };

  return (
    <Page title="Orders | CSL">
      <Card>
        <FilterTable
          filterName={filterName}
          onFilterName={handleFilterByName}
          handleReload={getOrders}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <TableHeadData
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
                              {order.customer?.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">
                          {order.customer?.email}
                        </TableCell>
                        <TableCell align="left">
                          {order.customer?.phoneNumber}
                        </TableCell>
                        <TableCell align="left">
                          £ {order.grandTotalToPay}
                        </TableCell>
                        <TableCell align="right">
                          <Label
                            variant="ghost"
                            color={payStatusColor[order.paymentStatus]}
                          >
                            {payStatus[order.paymentStatus]}
                          </Label>
                        </TableCell>
                        <TableCell align="right">
                          {new Date(order.createdAt)?.toLocaleString("en-GB")}
                        </TableCell>

                        <TableCell align="right">
                          <a
                            href={`/orders/invoice/${order._id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <IconButton>
                              <VisibilityIcon />
                            </IconButton>
                          </a>

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
    </Page>
  );
}
