import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip, SvgIcon, CircularProgress } from '@mui/material';
import { getSpriteIconUrl } from '../../utils/paymentMethods';

const PAYMENT_ICON_BASE_PATH = '/assets/images/payment';

/**
 * PaymentIcon component
 * Renders payment method icons with support for:
 * - Material UI components
 * - Image URLs
 * - SVG sprite references
 * - Lazy loading
 * - Error handling with fallbacks
 * - Consistent styling
 */
const PaymentIcon = ({
  icon,
  name,
  height = 24,
  width,
  opacity = 1,
  showTooltip = false,
  color,
  sx = {},
  isComponent = false,
  spriteId = null,
  lazyLoad = true
}) => {
  // State for lazy loading
  const [isLoading, setIsLoading] = useState(lazyLoad);
  // eslint-disable-next-line no-unused-vars
  const [hasError, setHasError] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState(null);
  
  // Calculate dimensions
  const calculatedWidth = width || (height * 1.67);
  
  // Determine if icon is a component (either explicitly marked or is a function)
  const isComponentIcon = isComponent || typeof icon === 'function';
  
  // Prioritize direct icon paths over sprites for better reliability
  // Check if icon is a string before using string methods
  const isIconString = typeof icon === 'string';
  const iconSrc = spriteId && isIconString && !icon.startsWith(PAYMENT_ICON_BASE_PATH) ? getSpriteIconUrl(spriteId) : icon;
  
  // Handle image loading
  useEffect(() => {
    if (!isComponentIcon && lazyLoad && iconSrc) {
      const img = new Image();
      img.src = iconSrc;
      img.onload = () => {
        setIsLoading(false);
        setLoadedSrc(iconSrc);
        setHasError(false);
      };
      img.onerror = () => {
        console.warn(`Failed to load icon: ${iconSrc}`);
        setIsLoading(false);
        
        // Try loading a direct path as fallback
        if (spriteId) {
          // Try direct path without sprite reference
          const fallbackSrc = `${PAYMENT_ICON_BASE_PATH}/${spriteId}.svg`;
          const fallbackImg = new Image();
          fallbackImg.src = fallbackSrc;
          fallbackImg.onload = () => {
            setLoadedSrc(fallbackSrc);
            setHasError(false);
          };
          fallbackImg.onerror = () => {
            // Try generic fallback as last resort
            const genericFallback = `${PAYMENT_ICON_BASE_PATH}/generic-card.svg`;
            setLoadedSrc(genericFallback);
            setHasError(false);
          };
        } else {
          // Use generic card as fallback
          setLoadedSrc(`${PAYMENT_ICON_BASE_PATH}/generic-card.svg`);
          setHasError(false);
        }
      };
    } else {
      setIsLoading(false);
    }
  }, [iconSrc, isComponentIcon, lazyLoad, spriteId]);

  // Render component icon
  const renderComponentIcon = () => (
    <SvgIcon
      component={icon}
      sx={{
        height: `${height}px`,
        width: width ? `${width}px` : `${height}px`,
        opacity,
        color: color || 'primary.main',
        ...sx
      }}
    />
  );

  // Render sprite icon with better fallback handling
  const renderSpriteIcon = () => {
    // If we have a loaded source that's different from the original sprite URL,
    // it means we're using a fallback, so render as an image instead
    if (loadedSrc && loadedSrc !== iconSrc) {
      return (
        <Box
          component="img"
          src={loadedSrc}
          alt={name}
          sx={{
            height: `${height}px`,
            width: width ? `${width}px` : 'auto',
            maxWidth: `${calculatedWidth}px`,
            opacity,
            verticalAlign: 'middle',
            display: 'inline-block',
            ...sx
          }}
        />
      );
    }
    
    // Otherwise use SVG with use tag for sprite reference
    return (
      <Box
        component="svg"
        sx={{
          height: `${height}px`,
          width: width ? `${width}px` : 'auto',
          maxWidth: `${calculatedWidth}px`,
          opacity,
          verticalAlign: 'middle',
          display: 'inline-block',
          ...sx
        }}
        aria-label={name}
      >
        <use xlinkHref={iconSrc} />
      </Box>
    );
  };

  // Render image icon
  const renderImageIcon = () => (
    <Box
      component="img"
      src={loadedSrc || iconSrc}
      alt={name}
      sx={{
        height: `${height}px`,
        width: width ? `${width}px` : 'auto',
        maxWidth: `${calculatedWidth}px`,
        objectFit: 'contain',
        opacity,
        verticalAlign: 'middle',
        display: 'inline-block',
        ...sx
      }}
      onError={(e) => {
        console.warn(`Failed to load icon: ${e.target.src}`);
        setHasError(true);
        
        // Try direct path first if we were using a sprite
        if (spriteId && e.target.src.includes('#')) {
          e.target.src = `${PAYMENT_ICON_BASE_PATH}/${spriteId}.svg`;
          return;
        }
        
        // Use a more reliable fallback icon path
        e.target.src = '/assets/images/payment/generic-card.svg';
        
        // If that also fails, use a data URI for a simple credit card icon
        e.target.onerror = () => {
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwMCI+PHBhdGggZD0iTTIwIDRINGMtMS4xMSAwLTIgLjg5LTIgMnYxMmMwIDEuMTEuODkgMiAyIDJoMTZjMS4xMSAwIDItLjg5IDItMlY2YzAtMS4xMS0uODktMi0yLTJ6bTAgMTRINFY2aDE2djEyem0tNi0xaDJ2LTJoLTJ2MnptLTQgMGgydi0yaC0ydjJ6bS00IDBoMnYtMkg2djJ6Ii8+PC9zdmc+';
        };
      }}
    />
  );

  // Render loading state
  const renderLoading = () => (
    <Box
      sx={{
        height: `${height}px`,
        width: width ? `${width}px` : `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
    >
      <CircularProgress size={Math.min(height, width || height) * 0.6} />
    </Box>
  );

  // Determine which icon to render
  const renderIcon = () => {
    if (isLoading) return renderLoading();
    if (isComponentIcon) return renderComponentIcon();
    if (spriteId && !hasError) return renderSpriteIcon();
    return renderImageIcon();
  };

  const IconComponent = renderIcon();

  return showTooltip ? (
    <Tooltip title={name} arrow placement="top">
      {IconComponent}
    </Tooltip>
  ) : IconComponent;
};

PaymentIcon.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]).isRequired,
  name: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  opacity: PropTypes.number,
  showTooltip: PropTypes.bool,
  color: PropTypes.string,
  sx: PropTypes.object,
  isComponent: PropTypes.bool,
  spriteId: PropTypes.string,
  lazyLoad: PropTypes.bool
};

export default React.memo(PaymentIcon);
