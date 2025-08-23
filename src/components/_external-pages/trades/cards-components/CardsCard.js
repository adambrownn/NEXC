import * as React from "react";
import { memo, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {
  CardMedia,
  Grid,
  Skeleton,
  Box,
  useTheme,
  Chip,
  Divider,
  Collapse,
  Button,
  Link,
  alpha,
  Modal,
  IconButton
} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ApplicationInfo from "../../forms/ApplicationInfo";
import ApplicationForm from "../../forms/ApplicationForm";

// Separate loading component for consistent layout
const CardSkeleton = () => (
  <Grid item xs={12} lg={4}>
    <Card sx={{ minHeight: 200 }}>
      <Skeleton variant="rectangular" height={150} animation="wave" />
      <CardContent>
        <Grid container>
          <Grid item xs={12} sm={10}>
            <Skeleton width="40%" height={24} animation="wave" />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Skeleton width={32} height={32} animation="wave" />
          </Grid>
        </Grid>
        <Skeleton width="80%" height={32} sx={{ mt: 1 }} animation="wave" />
        <Skeleton width="60%" height={24} sx={{ mt: 1 }} animation="wave" />
      </CardContent>
      <Box sx={{ px: 2, pb: 2 }}>
        <Skeleton width="100%" height={36} animation="wave" />
      </Box>
    </Card>
  </Grid>
);

// Enhanced card scheme information based on official sources
const getCardSchemeInfo = (category) => {
  switch (category?.toLowerCase()) {
    case 'cscs':
      return {
        fullName: "Construction Skills Certification Scheme",
        authority: "CSCS Ltd",
        website: "https://www.cscs.uk.com/",
        color: "#3277B4", // CSCS blue
        standardFee: 36,
        isReseller: true,
        description: "CSCS cards provide proof that individuals working on construction sites have the required training and qualifications for their specific role."
      };
    case 'skill':
      return {
        fullName: "Engineering Services SKILLcard",
        authority: "Engineering Services SKILLcard Ltd",
        website: "https://www.skillcard.org.uk/",
        color: "#00A651", // SKILLcard green
        standardFee: null,
        isReseller: false,
        description: "SKILLcards are for those working in heating, ventilation, air conditioning, refrigeration and plumbing industries."
      };
    case 'cisrs':
      return {
        fullName: "Construction Industry Scaffolders Record Scheme",
        authority: "CISRS",
        website: "https://cisrs.org.uk/",
        color: "#F28C00", // CISRS orange
        standardFee: null,
        isReseller: false,
        description: "CISRS is the industry-recognized certification scheme for scaffolding operations, providing proof of competence for scaffolders."
      };
    case 'cpcs':
      return {
        fullName: "Construction Plant Competence Scheme",
        authority: "NOCN Job Cards",
        website: "https://www.nocnjobcards.org/",
        color: "#E31B23", // NOCN red
        standardFee: null,
        isReseller: false,
        description: "CPCS cards demonstrate competence in operating construction plant machinery and equipment, essential for safety on sites."
      };
    default:
      return {
        fullName: "Construction Certification Card",
        authority: "Industry Certification Body",
        color: "#757575", // Gray
        standardFee: null,
        isReseller: false,
        description: "Industry certification card verifying competence for construction site work."
      };
  }
};

const CardsCard = memo((props) => {
  const theme = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const schemeInfo = getCardSchemeInfo(props.category);
  const price = props.price || 0;

  // Service fee calculation (only for CSCS with standard fee)
  const standardFee = schemeInfo.standardFee || 0;
  const serviceFee = standardFee ? (price - standardFee) : price;

  // Handle image loading states
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Show fallback content
  };

  const handleOpenFullImage = () => {
    setShowFullImage(true);
  };

  const handleCloseFullImage = () => {
    setShowFullImage(false);
  };

  if (!props.title) {
    return <CardSkeleton />;
  }

  return (
    <Grid item xs={12} sm={6} lg={4}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          background: (theme) => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(schemeInfo.color, 0.05)})`,
          borderRadius: 2,
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            background: (theme) => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(schemeInfo.color, 0.1)})`
          },
          // Maintain existing trade association highlight
          ...(props.tradeId && props.isAssociated && {
            border: '1px solid',
            borderColor: 'primary.main',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
          })
        }}
      >
        {/* Category badge */}
        <Chip
          label={props.category.toUpperCase()}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
            backgroundColor: alpha(schemeInfo.color, 0.2),
            color: schemeInfo.color,
            fontWeight: 600,
            fontSize: '0.7rem',
            borderRadius: '4px',
            '& .MuiChip-label': { px: 1 }
          }}
        />

        {/* Image with mask/blur effect */}
        <Box
          sx={{
            position: 'relative',
            height: 150,
            backgroundColor: alpha(schemeInfo.color, 0.05),
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          onClick={handleOpenFullImage}
        >
          {/* Show skeleton while loading */}
          {!imageLoaded && (
            <Skeleton
              variant="rectangular"
              height="100%"
              width="100%"
              animation="wave"
            />
          )}

          {/* Card image with mask */}
          <CardMedia
            style={{
              objectFit: "scale-down",
              opacity: imageLoaded ? 0.7 : 0, // Semi-transparent by default
              transition: 'opacity 0.3s ease-in-out',
              height: '100%',
              filter: 'blur(1px)' // Slight blur effect
            }}
            component="img"
            image={!imageError ? `/static/${props.category}/${props.title}.png` : '/static/placeholder-image.png'}
            alt={`${props.title} ${props.category.toUpperCase()} Card`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* "Click to view" overlay */}
          {imageLoaded && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.1)',
                color: 'white',
                fontWeight: 500,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }
              }}
            >
              <Typography
                variant="button"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  fontSize: '0.75rem'
                }}
              >
                Click to view card
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}>
          {/* Card title */}
          <Typography
            gutterBottom
            variant="h5"
            component="h3"
            sx={{
              lineHeight: 1.2,
              overflow: "hidden",
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.4em',
              fontWeight: 600,
              mb: 1
            }}
          >
            {props.title}
          </Typography>

          {/* Metadata display */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mb: 1.5,
              alignItems: 'center'
            }}
          >
            {/* Validity chip */}
            {props.validity && (
              <Chip
                size="small"
                icon={<VerifiedIcon fontSize="small" />}
                label={`${props.validity} validity`}
                sx={{
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.dark,
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: theme.palette.success.main,
                  }
                }}
              />
            )}

            {/* Info button - This is the "i" button from ApplicationInfo component */}
            <Box>
              <ApplicationInfo {...props} type="cards" />
            </Box>

            {/* Price button - NEW */}
            {price > 0 && (
              <Chip
                size="small"
                icon={<AttachMoneyIcon fontSize="small" />}
                label={`£${price.toFixed(2)}`}
                onClick={() => setShowPricing(!showPricing)}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.dark,
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '& .MuiChip-icon': {
                    color: theme.palette.primary.main,
                  }
                }}
              />
            )}
          </Box>

          {/* Card description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.4,
              overflow: "hidden",
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              minHeight: '4.2em',
              mb: 1
            }}
          >
            {props.description || schemeInfo.description}
          </Typography>

          {/* NEW: Price breakdown in collapsible section */}
          <Collapse in={showPricing}>
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Price Breakdown
              </Typography>
              <Grid container spacing={1} alignItems="center">
                {schemeInfo.isReseller && schemeInfo.standardFee && (
                  <>
                    <Grid item xs={7}>
                      <Typography variant="caption" color="text.secondary">
                        Standard {props.category.toUpperCase()} fee:
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="caption" align="right" display="block">
                        £{standardFee.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="caption" color="text.secondary">
                        Processing fee:
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="caption" align="right" display="block">
                        £{serviceFee.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                  </>
                )}
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.primary">
                    Total:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle1"
                    color={schemeInfo.color}
                    align="right"
                    fontWeight="600"
                  >
                    £{price.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>

          {/* Expandable details section */}
          <Collapse in={showDetails}>
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
              <Typography variant="subtitle2" gutterBottom>
                About {props.title} {props.category.toUpperCase()} Cards
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                {props.longDescription || `The ${props.title} is part of the ${schemeInfo.fullName} and is issued by ${schemeInfo.authority}. This card verifies competence for construction workers in the ${props.title.toLowerCase()} role.`}
              </Typography>

              {/* CSCS disclaimer moved here */}
              {schemeInfo.isReseller && (
                <Box
                  sx={{
                    mt: 2,
                    mb: 2,
                    p: 1.5,
                    backgroundColor: alpha('#e3f2fd', 0.5),
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'start',
                    gap: 1
                  }}
                >
                  <InfoOutlinedIcon color="info" fontSize="small" sx={{ mt: 0.3 }} />
                  <Typography variant="caption" color="text.secondary">
                    NEXC is an authorized reseller of CSCS cards. All cards are issued directly by CSCS Ltd.
                  </Typography>
                </Box>
              )}

              {schemeInfo.website && (
                <Button
                  size="small"
                  variant="outlined"
                  component={Link}
                  href={schemeInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    mb: 2,
                    textTransform: 'none',
                    borderColor: alpha(schemeInfo.color, 0.5),
                    color: schemeInfo.color,
                    '&:hover': {
                      borderColor: schemeInfo.color,
                      backgroundColor: alpha(schemeInfo.color, 0.1)
                    }
                  }}
                >
                  Official {props.category.toUpperCase()} Website
                </Button>
              )}
            </Box>
          </Collapse>

          {/* Toggle details button */}
          <Button
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            endIcon={showDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            sx={{ mt: 1, textTransform: 'none', p: 0, minWidth: 'auto' }}
          >
            {showDetails ? 'Less details' : 'More details'}
          </Button>
        </CardContent>

        {/* Application button */}
        <Box sx={{ mt: 'auto' }}>
          <ApplicationForm {...props} type="cards" />
        </Box>
      </Card>

      {/* Full image modal */}
      <Modal
        open={showFullImage}
        onClose={handleCloseFullImage}
        aria-labelledby="card-image-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{
          position: 'relative',
          maxWidth: 500,
          width: '100%',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 2
        }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
            onClick={handleCloseFullImage}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Typography id="card-image-modal" variant="h6" component="h2" gutterBottom>
            {props.title} {props.category.toUpperCase()} Card
          </Typography>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <img
              src={!imageError ? `/static/${props.category}/${props.title}.png` : '/static/placeholder-image.png'}
              alt={`${props.title} ${props.category.toUpperCase()} Card`}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          </Box>
        </Box>
      </Modal>
    </Grid>
  );
});

CardsCard.displayName = 'CardsCard';

export default CardsCard;
