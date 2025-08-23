import PropTypes from 'prop-types';
import {
    Box,
    Container,
    Paper,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';

// ----------------------------------------------------------------------

CheckoutLayout.propTypes = {
    children: PropTypes.node,
    pageTitle: PropTypes.string,
    pageDescription: PropTypes.string
};

export default function CheckoutLayout({ children, pageTitle, pageDescription }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box 
            sx={{ 
                bgcolor: theme.palette.background.checkout?.default || theme.palette.background.default,
                minHeight: '100vh',
                pt: { xs: 2, md: 4 },
                pb: { xs: 4, md: 6 }
            }}
        >
            <Container maxWidth="xl">
                <Box sx={{
                    py: { xs: 3, md: 5 },
                    px: { xs: 2, md: 3 }
                }}>
                    {pageTitle && (
                        <Box sx={{
                            mb: 4,
                            textAlign: { xs: 'center', sm: 'left' }
                        }}>
                            <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
                                {pageTitle}
                            </Typography>

                            {pageDescription && (
                                <Typography variant="body1" color="text.secondary">
                                    {pageDescription}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <Paper
                        elevation={3}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: 2,
                            bgcolor: theme.palette.background.checkout?.paper || theme.palette.background.paper,
                            boxShadow: theme.customShadows?.z16 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                            position: 'relative',
                            '&:before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '4px',
                                bgcolor: theme.palette.primary.main,
                                borderTopLeftRadius: '8px',
                                borderTopRightRadius: '8px'
                            }
                        }}
                    >
                        {children}
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
}