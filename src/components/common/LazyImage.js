import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Skeleton } from '@mui/material';

/**
 * LazyImage component for loading images only when they are about to enter the viewport
 * Uses IntersectionObserver API for efficient lazy loading
 */
const LazyImage = ({
  src,
  alt,
  height,
  width,
  sx = {},
  onError,
  placeholder = null,
  threshold = 0.1,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Skip if already loaded or has error
    if (isLoaded || hasError) return;
    
    // Skip if not in view yet
    if (!isInView) return;
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoaded(true);
    };
    
    img.onerror = (e) => {
      setHasError(true);
      if (onError) onError(e);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isInView, isLoaded, hasError, onError]);

  useEffect(() => {
    // Set up intersection observer to detect when image is about to enter viewport
    const element = document.getElementById(`lazy-image-${src.replace(/[^a-zA-Z0-9]/g, '-')}`);
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [src, threshold]);

  // Generate a unique ID for the image container
  const imageId = `lazy-image-${src.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  // Base styles
  const baseStyles = {
    display: 'inline-block',
    ...sx,
  };

  // Show placeholder while loading
  if (!isLoaded && !hasError) {
    return (
      <Box 
        id={imageId}
        sx={{
          ...baseStyles,
          height: height || 'auto',
          width: width || 'auto',
        }}
      >
        {placeholder || (
          <Skeleton 
            variant="rectangular" 
            width={width || '100%'} 
            height={height || 24} 
            animation="wave"
          />
        )}
      </Box>
    );
  }

  // Show image once loaded
  return (
    <Box
      component="img"
      id={imageId}
      src={src}
      alt={alt}
      height={height}
      width={width}
      sx={baseStyles}
      {...props}
    />
  );
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sx: PropTypes.object,
  onError: PropTypes.func,
  placeholder: PropTypes.node,
  threshold: PropTypes.number,
};

export default LazyImage;
