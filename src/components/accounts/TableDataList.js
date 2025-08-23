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
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
// components
import Page from "../Page";
import Label from "../Label";
import Scrollbar from "../Scrollbar";
import SearchNotFound from "../SearchNotFound";
import { TableHeadData, FilterTable } from "./index";
import axiosInstance from "../../axiosConfig";

const TABLE_HEAD = [
  { id: "name", label: "Name", alignRight: false },
  { id: "phoneNumber", label: "Phone Number", alignRight: false },
  { id: "email", label: "Email", alignRight: false },
  { id: "accountType", label: "Account Type", alignRight: false },
  { id: "createdAt", label: "Created On", alignRight: true },
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
  if (["name"].includes(orderBy)) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
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
      (_order) => _order.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
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

  const [accountsList, setAccountsList] = useState([]);

  const getAccounts = async () => {
    const resp = await axiosInstance.get("/user");
    setAccountsList(resp.data || []);
  };

  useEffect(() => {
    getAccounts();
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
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - accountsList.length) : 0;

  const filteredUsers = applySortFilter(
    accountsList,
    getComparator(order, orderBy),
    filterName
  );

  const isUserNotFound = filteredUsers.length === 0;

  const handleDeleteUser = async (userId) => {
    const resp = await axiosInstance.delete(`/user/${userId}`);
    if (!resp.err) {
      const newList = accountsList.filter((order) => order._id !== userId);
      setAccountsList(newList);
    } else {
      alert("Unable to delete");
    }
  };

  return (
    <Page title="Users | CSL">
      <Card>
        <FilterTable
          filterName={filterName}
          onFilterName={handleFilterByName}
          handleReload={getAccounts}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <TableHeadData
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={accountsList.length}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => {
                    return (
                      <TableRow
                        hover
                        key={user._id}
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
                              {user?.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left" variant="footer">
                          {user?.phoneNumber || "NA"}
                        </TableCell>
                        <TableCell align="left" variant="footer">
                          {user?.email || "NA"}
                        </TableCell>
                        <TableCell>
                          <Label variant="ghost">{user?.accountType}</Label>
                        </TableCell>
                        <TableCell align="right">
                          {new Date(user.createdAt)?.toLocaleString("en-GB")}
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            onClick={() => {
                              const ifYes = window.confirm("Are you sure?");
                              if (ifYes) {
                                handleDeleteUser(user._id);
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
          count={accountsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Page>
  );
}
