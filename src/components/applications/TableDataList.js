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
  FormControl,
  Select,
  MenuItem,
} from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";
// components
import Page from "../Page";
import Label from "../Label";
import Scrollbar from "../Scrollbar";
import SearchNotFound from "../SearchNotFound";
import { TableHeadData, FilterTable } from "./index";
import axiosInstance from "../../axiosConfig";

const TABLE_HEAD = [
  { id: "name", label: "Name", alignRight: false },
  { id: "contact", label: "Contact", alignRight: false },
  { id: "description", label: "Info", alignRight: false },
  { id: "checkoutPoint", label: "Status", alignRight: true },
  { id: "appliedFor", label: "Type", alignRight: true },
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

  const [applicationsList, setApplicationsList] = useState([]);

  const getApplications = async () => {
    const resp = await axiosInstance.post("/applications");
    setApplicationsList(resp.data || []);
  };

  useEffect(() => {
    getApplications();
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
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - applicationsList.length)
      : 0;

  const filteredUsers = applySortFilter(
    applicationsList,
    getComparator(order, orderBy),
    filterName
  );

  const isUserNotFound = filteredUsers.length === 0;

  const handleDeleteApplication = async (applicationId) => {
    const resp = await axiosInstance.delete(`/applications/${applicationId}`);
    if (!resp.err) {
      const newList = applicationsList.filter(
        (order) => order._id !== applicationId
      );
      setApplicationsList(newList);
    } else {
      alert("Unable to delete");
    }
  };

  const handleApplicationStatus = async (value, applicationId) => {
    const resp = await axiosInstance.put(`/applications/${applicationId}`, {
      checkoutPoint: value,
    });
    if (!resp.err) {
      getApplications();
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
          handleReload={getApplications}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <TableHeadData
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={applicationsList.length}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((application) => {
                    return (
                      <TableRow
                        hover
                        key={application._id}
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
                              {application?.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left" variant="footer">
                          {application?.email}
                          <br />
                          {application?.phoneNumber}
                        </TableCell>
                        <TableCell align="left" variant="footer">
                          {application.applicationType === "qualification" && (
                            <>
                              Applied: <strong>{application.appliedFor}</strong>
                              <br />
                              Address: <span>{application.address}</span>
                            </>
                          )}
                          {application.applicationType === "groupbooking" && (
                            <>
                              COMPANY: <strong>{application.company}</strong>
                              <br />
                            </>
                          )}
                          {application.applicationType === "contactus" && (
                            <>
                              Subject: <strong>{application.subject}</strong>
                              <br />
                              Message: <span>{application.message}</span>
                            </>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <FormControl size="small">
                            <Select
                              labelId="statusapplication"
                              id="application-status"
                              value={application?.checkoutPoint}
                              onChange={(e) =>
                                handleApplicationStatus(
                                  e.target.value,
                                  application._id
                                )
                              }
                            >
                              <MenuItem value={0}>New</MenuItem>
                              <MenuItem value={1}>Resolved</MenuItem>
                              <MenuItem value={2}>Rejected</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right">
                          <Label variant="ghost">
                            {application?.applicationType}{" "}
                          </Label>
                        </TableCell>
                        <TableCell align="right">
                          {new Date(application.createdAt)?.toLocaleString(
                            "en-GB"
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            onClick={() => {
                              const ifYes = window.confirm("Are you sure?");
                              if (ifYes) {
                                handleDeleteApplication(application._id);
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
          count={applicationsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Page>
  );
}
