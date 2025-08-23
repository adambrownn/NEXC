import React, { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Skeleton
} from '@mui/material';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';

// Helper function to get status configuration - reusing from ActiveServices
const getStatusConfig = (status) => {
    const configs = {
        PENDING: { color: 'warning', label: 'Pending', icon: 'eva:clock-outline' },
        CONFIRMED: { color: 'info', label: 'Confirmed', icon: 'eva:checkmark-circle-outline' },
        IN_PROGRESS: { color: 'primary', label: 'In Progress', icon: 'eva:activity-outline' },
        COMPLETED: { color: 'success', label: 'Completed', icon: 'eva:checkmark-circle-2-outline' },
        CANCELLED: { color: 'error', label: 'Cancelled', icon: 'eva:close-circle-outline' },
    };
    return configs[status] || configs.PENDING;
};

export default function ServiceHistory({ services = [], isLoading }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (isLoading) {
        return (
            <Box sx={{ width: '100%' }}>
                <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={400} />
            </Box>
        );
    }

    if (services.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <Icon icon="eva:folder-outline" width={60} height={60} style={{ opacity: 0.3 }} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    No service history found
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    You haven't completed any services yet
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    href="/trades"
                    startIcon={<Icon icon="eva:plus-fill" />}
                >
                    Book New Service
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Your Service History
            </Typography>

            <Paper sx={{ width: '100%' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Service</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Reference</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {services
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((service) => {
                                    const statusConfig = getStatusConfig(service.status);
                                    return (
                                        <TableRow key={service.id || service._id}>
                                            <TableCell>
                                                <Typography variant="subtitle2">
                                                    {service.serviceName || service.title || 'Service'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {service.description || service.type || 'No description'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {service.completedDate ? (
                                                    format(new Date(service.completedDate), 'dd MMM yyyy')
                                                ) : service.appointmentDate ? (
                                                    format(new Date(service.appointmentDate), 'dd MMM yyyy')
                                                ) : (
                                                    'N/A'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontFamily="monospace">
                                                    {service.reference || (service.id || service._id).toString().substring(0, 8)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    icon={<Icon icon={statusConfig.icon} width={16} height={16} />}
                                                    label={statusConfig.label}
                                                    color={statusConfig.color}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    href={`/service-details/${service.id || service._id}`}
                                                >
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={services.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}