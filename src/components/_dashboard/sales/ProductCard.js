import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ImageIcon from '@mui/icons-material/Image';

const ProductImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

const PlaceholderBox = styled(Box)({
  top: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f5f5f5',
  color: '#9e9e9e'
});

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
    category: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string
  }).isRequired
};

export default function ProductCard({ product }) {
  const { name, price, image, category, status } = product;
  const [imageError, setImageError] = useState(false);

  const handleAddToOrder = () => {
    console.log('Adding to order:', product);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {imageError ? (
          <PlaceholderBox>
            <ImageIcon sx={{ fontSize: 60 }} />
          </PlaceholderBox>
        ) : (
          <ProductImgStyle
            alt={name}
            src={image}
            onError={handleImageError}
          />
        )}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
          <Chip
            label={category}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={0.5}>
            <Typography variant="subtitle1">${price.toFixed(2)}</Typography>
            {status && (
              <Chip
                label={status}
                size="small"
                color={getStatusColor(status)}
                sx={{ ml: 1 }}
              />
            )}
          </Stack>
          <Button
            variant="contained"
            size="small"
            onClick={handleAddToOrder}
            startIcon={<AddShoppingCartIcon />}
          >
            Add
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
