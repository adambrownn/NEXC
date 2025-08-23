import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Slider,
  Box,
  Paper,
  Fade,
  alpha,
  Alert
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import axiosInstance from "../../../axiosConfig";
import { calculateDistance } from '../../../utils/mapUtils';

// Mapbox token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibmV4Y21hcCIsImEiOiJjbTY5N3Q4OTgwODduMmxzY2s5aDA0bXp1In0.wnyDsAjgVJw794zpvWf93g';

function LandingMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const centersRef = useRef([]);
  const cleanupInProgress = useRef(false);
  const mapInitialized = useRef(false);
  const [noResults, setNoResults] = useState(false);

  const [postCode, setPostCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [radius, setRadius] = useState(50);
  const [error, setError] = useState("");

  const createPopupContent = useCallback((center, distance = null) => {
    return `
      <div style="
        font-family: Arial, sans-serif;
        padding: 12px;
        border-radius: 12px;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        overflow: hidden;
      ">
        <div style="
          background: linear-gradient(45deg, #1976d2, #2196f3);
          margin: -12px -12px 10px -12px;
          padding: 16px;
          border-radius: 12px 12px 0 0;
          color: white;
          font-weight: bold;
          font-size: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <span>${center.title}</span>
          ${distance ? `<span style="
            font-size: 14px;
            background: rgba(255,255,255,0.2);
            padding: 3px 8px;
            border-radius: 12px;
          ">${distance.toFixed(1)} miles</span>` : ''}
        </div>
        
        <div style="
          display: grid;
          gap: 12px;
          color: #333;
          padding: 4px;
        ">
          <div style="
            display: flex;
            align-items: start;
            gap: 10px;
          ">
            <svg style="min-width: 20px; margin-top: 3px; color: #1976d2;" width="20" height="20" viewBox="0 0 24 24" fill="#1976d2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span style="line-height: 1.5; font-size: 14px;">
              ${center.address}<br/>
              <strong>${center.postcode}</strong>
            </span>
          </div>
          
          <div style="
            margin-top: 8px;
            padding-top: 12px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            gap: 12px;
          ">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${center.address} ${center.postcode}`)}" 
               target="_blank"
               style="
                 text-decoration: none;
                 color: #1976d2;
                 font-weight: 600;
                 font-size: 14px;
                 display: flex;
                 align-items: center;
                 gap: 6px;
                 padding: 8px 12px;
                 border-radius: 8px;
                 background: rgba(25, 118, 210, 0.1);
                 transition: all 0.2s ease;
               "
               onmouseover="this.style.background='rgba(25, 118, 210, 0.2)';"
               onmouseout="this.style.background='rgba(25, 118, 210, 0.1)';"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1976d2">
                <path d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/>
              </svg>
              Directions
            </a>
            <a href="/trades/?category=operative#csl-tests" 
               style="
                 background: linear-gradient(45deg, #FCA700, #FFB938);
                 color: #000;
                 border: none;
                 padding: 8px 16px;
                 border-radius: 8px;
                 cursor: pointer;
                 font-size: 14px;
                 font-weight: 600;
                 text-decoration: none;
                 transition: all 0.2s ease;
                 box-shadow: 0 2px 8px rgba(252, 167, 0, 0.3);
               "
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(252, 167, 0, 0.4)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(252, 167, 0, 0.3)';"
            >
              Book Now
            </a>
          </div>
        </div>
      </div>
    `;
  }, []);

  const cleanupMap = useCallback(() => {
    if (cleanupInProgress.current) return;
    cleanupInProgress.current = true;

    try {
      // Remove all markers first
      if (markers.current) {
        markers.current.forEach(markerData => {
          if (markerData?.marker) {
            try {
              markerData.marker.remove();
            } catch (e) {
              console.error('Error removing marker:', e);
            }
          }
        });
        markers.current = [];
      }

      // Remove map instance
      if (map.current) {
        try {
          map.current.off();
          map.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
        map.current = null;
      }

      // Reset refs
      centersRef.current = [];
      mapInitialized.current = false;
    } catch (e) {
      console.error('Error during cleanup:', e);
    } finally {
      cleanupInProgress.current = false;
    }
  }, []);

  const addMarker = useCallback((center, isNearest = false, distance = null) => {
    if (!map.current || cleanupInProgress.current) {
      console.warn('Cannot add marker: map not initialized or cleanup in progress');
      return null;
    }

    try {
      const lng = center.geoLocation?.coordinates?.[0] ?? center.longitude;
      const lat = center.geoLocation?.coordinates?.[1] ?? center.latitude;

      if (!lng || !lat) {
        console.warn('Invalid coordinates for center:', center);
        return null;
      }

      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';

      // Enhanced marker styling with better visual design
      const markerColor = isNearest ? '#00C853' : '#1976d2';
      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${markerColor};
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transform-origin: center bottom;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
          ">
            ${isNearest ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>' : ''}
          </div>
          ${isNearest ?
          `<div style="
              background-color: ${markerColor};
              color: white;
              font-size: 10px;
              padding: 2px 6px;
              border-radius: 10px;
              margin-top: 2px;
              font-weight: bold;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">NEAREST</div>` : ''}
        </div>
      `;

      el.style.cursor = 'pointer';

      // Add hover effect with JavaScript
      el.onmouseover = () => {
        const markerDiv = el.querySelector('div > div');
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1.15)';
          markerDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        }
      };
      el.onmouseout = () => {
        const markerDiv = el.querySelector('div > div');
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1)';
          markerDiv.style.boxShadow = '0 3px 8px rgba(0,0,0,0.3)';
        }
      };

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat([lng, lat]);

      // Create and set popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        maxWidth: '350px',
        closeButton: true,
        closeOnClick: false,
        className: 'nexc-custom-popup'
      })
        .setHTML(createPopupContent(center, distance));

      marker.setPopup(popup);
      marker.addTo(map.current);

      return {
        marker,
        center: {
          id: center._id,
          title: center.title,
          coordinates: [lng, lat]
        },
        isNearest
      };
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  }, [createPopupContent]);

  const fetchCenters = useCallback(async () => {
    try {
      // Use cached centers if available
      if (centersRef.current.length > 0) {
        console.log('Using cached centers');
        return centersRef.current;
      }

      console.log('Fetching centers...');
      const resp = await axiosInstance.get("/centers");

      if (resp.data?.success && Array.isArray(resp.data.data)) {
        console.log(`Found ${resp.data.data.length} centers`);
        centersRef.current = resp.data.data;
        return resp.data.data;
      }

      setError("Invalid data format received from server");
      return null;
    } catch (error) {
      console.error("Error fetching centers:", error);
      setError("Failed to fetch centers. Please try again later.");
      return null;
    }
  }, []);

  const updateMarkers = useCallback((centers, centerPoint = null) => {
    if (!map.current || !centers || cleanupInProgress.current) return;

    console.log('Updating markers with:', {
      centersCount: centers.length,
      hasCenterPoint: !!centerPoint,
      radius
    });

    // Clear existing markers
    markers.current.forEach(markerData => {
      if (markerData?.marker) {
        try {
          markerData.marker.remove();
        } catch (e) {
          console.error('Error removing marker:', e);
        }
      }
    });
    markers.current = [];

    const newMarkers = [];

    if (centerPoint && radius) {
      // Create user location marker with a location icon
      const userLocationEl = document.createElement('div');
      userLocationEl.innerHTML = `
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;
      userLocationEl.style.cssText = `
        transform: translate(-50%, -50%);
      `;

      const userLocationMarker = new mapboxgl.Marker({
        element: userLocationEl,
        anchor: 'center'
      })
        .setLngLat(centerPoint)
        .addTo(map.current);

      console.log('Added user location marker at:', centerPoint);
      newMarkers.push({ marker: userLocationMarker, isUserLocation: true, coordinates: centerPoint });

      // Process centers with distances
      const markersWithDistance = centers
        .map(center => {
          const centerLat = center.geoLocation?.coordinates?.[1] ?? center.latitude;
          const centerLng = center.geoLocation?.coordinates?.[0] ?? center.longitude;

          if (!centerLat || !centerLng) {
            console.log('Invalid center coordinates:', center);
            return null;
          }

          return {
            center,
            coordinates: [centerLng, centerLat],
            distance: calculateDistance(
              centerPoint[1],
              centerPoint[0],
              centerLat,
              centerLng
            )
          };
        })
        .filter(item => item && item.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      console.log(`Found ${markersWithDistance.length} centers within ${radius} miles`);

      // Set noResults state based on markersWithDistance
      setNoResults(markersWithDistance.length === 0);

      // Add center markers with proper coloring
      markersWithDistance.forEach((item, index) => {
        const isNearest = index === 0;
        const markerData = addMarker(item.center, isNearest, item.distance);
        if (markerData) {
          console.log(`Successfully added ${isNearest ? 'nearest' : 'regular'} marker for: ${item.center.title}`);
          newMarkers.push({ ...markerData, coordinates: item.coordinates });
        }
      });

      // Update markers reference
      markers.current = newMarkers;
      console.log(`Total markers added: ${newMarkers.length} (${newMarkers.filter(m => !m.isUserLocation).length} centers + 1 user location)`);

      // Enhance the bounds calculation for better user experience
      if (newMarkers.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();

        // Always include the search location
        bounds.extend(centerPoint);

        // If we have centers, ensure at least the nearest one is visible
        if (markersWithDistance.length > 0) {
          bounds.extend(markersWithDistance[0].coordinates);

          // If it's the only center and very close to search point, extend bounds for better visibility
          if (markersWithDistance.length === 1 && markersWithDistance[0].distance < 2) {
            const [lng, lat] = centerPoint;
            bounds.extend([lng + 0.05, lat + 0.05]);
            bounds.extend([lng - 0.05, lat - 0.05]);
          }
        } else {
          // If no centers found, create a small bounds around the user location
          const [lng, lat] = centerPoint;
          bounds.extend([lng + 0.2, lat + 0.2]);
          bounds.extend([lng - 0.2, lat - 0.2]);
        }

        // Fit bounds with enhanced animation
        map.current.fitBounds(bounds, {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          maxZoom: 13, // Limit maximum zoom to show more context
          duration: 2000,
          essential: true,
          easing: function (t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          }
        });
      }
    }
  }, [radius, addMarker]);

  // Create an enhanced flyTo function
  const enhancedFlyTo = useCallback((coords, zoom = 12) => {
    if (!map.current) return;

    map.current.flyTo({
      center: coords,
      zoom: zoom,
      duration: 2000,
      essential: true,
      easing: function (t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }
    });
  }, []);

  // Update the handleLocationSearch function to use enhancedFlyTo
  const handleLocationSearch = useCallback(async (searchedPostcode = null) => {
    const postCodeToSearch = searchedPostcode || postCode;
    if (!postCodeToSearch || !map.current) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${postCodeToSearch}.json?access_token=${mapboxgl.accessToken}&country=gb&types=postcode`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;

        // First, fetch centers
        const centers = await fetchCenters();
        if (!centers) {
          setError("Failed to fetch centers. Please try again.");
          return;
        }

        console.log('Centers received:', centers);

        // Use enhanced flyTo
        enhancedFlyTo([lng, lat]);

        // Rest is the same
        map.current.once('moveend', () => {
          console.log('Map movement finished, adding markers...');
          updateMarkers(centers, [lng, lat]);
        });
      } else {
        setError("Invalid postcode. Please enter a valid UK postcode.");
      }
    } catch (error) {
      console.error("Error in location search:", error);
      setError("Failed to search location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [postCode, fetchCenters, updateMarkers, enhancedFlyTo]);

  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocode to get postcode
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&country=gb`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
              const postcode = data.features[0].text;
              setPostCode(postcode);
              handleLocationSearch(postcode);
            }
          } catch (error) {
            console.error("Error in reverse geocoding:", error);
            setError("Failed to get your location. Please enter postcode manually.");
          }
        },
        () => {
          setError("Unable to get your location. Please enter postcode manually.");
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleSearchClick = useCallback(() => {
    if (postCode) {
      handleLocationSearch();
    }
  }, [postCode, handleLocationSearch]);

  useEffect(() => {
    if (!mapboxgl.supported()) {
      setError('Your browser does not support Mapbox GL');
      return;
    }

    if (mapInitialized.current || cleanupInProgress.current) return;
    mapInitialized.current = true;

    const initMap = async () => {
      try {
        if (mapContainer.current) {
          mapContainer.current.innerHTML = '';
        }

        const newMapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-2.8518416, 55.1041204],
          zoom: 6,
          attributionControl: true,
        });

        newMapInstance.on('load', async () => {
          map.current = newMapInstance;
          // Don't show markers initially, just fetch and cache the centers
          await fetchCenters();
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Error initializing map. Please refresh the page.');
      }
    };

    initMap();

    // Return cleanupMap as the cleanup function
    return cleanupMap;
  }, [cleanupMap, fetchCenters]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const { width, height } = mapContainer.current.getBoundingClientRect();
    console.log('Map container dimensions:', { width, height });
  }, []);

  useEffect(() => {
    // Add CSS if not already present
    if (!document.getElementById('marker-styles')) {
      const style = document.createElement('style');
      style.id = 'marker-styles';
      style.textContent = `
        .marker {
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          width: 32px;
          height: 32px;
          cursor: pointer;
        }
        .marker:hover {
          transform: scale(1.1);
        }
        
        /* Enhanced popup styling */
        .mapboxgl-popup {
          z-index: 20;
        }
        
        .mapboxgl-popup-content {
          padding: 0 !important;
          overflow: hidden;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
          transition: transform 0.3s ease;
        }
        
        .mapboxgl-popup-close-button {
          color: white !important;
          font-size: 1.5rem !important;
          right: 8px !important;
          top: 8px !important;
          background-color: rgba(0, 0, 0, 0.1) !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          line-height: 1 !important;
        }
        
        .mapboxgl-popup-close-button:hover {
          background-color: rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Pulsating effect for nearest marker */
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 200, 83, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 200, 83, 0); }
        }
        
        .nearest-marker .marker-dot {
          animation: pulse 2s infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Add mobile responsiveness handler
  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        // Adjust padding for popups on mobile
        if (window.innerWidth < 600) {
          // More padding on mobile for better visibility of controls
          map.current.setPadding({ top: 50, bottom: 200, left: 20, right: 20 });
        } else {
          map.current.setPadding({ top: 100, bottom: 100, left: 50, right: 50 });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ my: { xs: 6, md: 10 } }}>
      <Fade in={true} timeout={1000}>
        <Box>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Find Your Nearest Test Center
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              maxWidth: '650px',
              mx: 'auto',
              mb: 5,
              color: 'text.secondary',
              fontSize: { xs: '1rem', md: '1.125rem' }
            }}
          >
            Enter your postcode to find nearby CSCS test centers and get instant directions.
            All our centers offer same-day bookings and fast-track services.
          </Typography>

          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 5 }}>
            <Paper
              elevation={6}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                p: 3,
                boxShadow: theme => `0 8px 32px ${alpha(theme.palette.grey[500], 0.1)}`,
                border: theme => `1px solid ${alpha(theme.palette.grey[300], 0.2)}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <TextField
                    fullWidth
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                    placeholder="Enter your postcode"
                    variant="outlined"
                    sx={{
                      mr: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        height: 56
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: postCode && (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setPostCode('')} size="small">
                            <CloseIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    onClick={handleUseMyLocation}
                    variant="outlined"
                    sx={{
                      minWidth: 56,
                      height: 56,
                      borderRadius: 2,
                      ml: 1
                    }}
                    disabled={isLoading}
                  >
                    <MyLocationIcon />
                  </Button>
                </Box>

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Search Radius: {radius} miles
                </Typography>

                <Slider
                  value={radius}
                  onChange={(_, newValue) => setRadius(newValue)}
                  min={5}
                  max={100}
                  step={5}
                  marks={[
                    { value: 5, label: '5mi' },
                    { value: 50, label: '50mi' },
                    { value: 100, label: '100mi' }
                  ]}
                  valueLabelDisplay="auto"
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                      height: 20,
                      width: 20,
                    },
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSearchClick}
                disabled={!postCode || isLoading}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px 0 rgba(0,0,0,0.15)',
                  }
                }}
              >
                Search Near Me
              </Button>
            </Paper>
          </Box>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: '400px', md: '500px' },
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            }}
          >
            <div
              className="map-container"
              ref={mapContainer}
              style={{
                borderRadius: '16px',
                width: '100%',
                height: '100%'
              }}
            />
            {(!mapInitialized.current || isLoading) && (
              <div className="loading-overlay" style={{ borderRadius: '16px' }}>
                <CircularProgress />
              </div>
            )}

            <Box
              className="map-legend"
              sx={{
                position: 'absolute',
                bottom: 24,
                right: 24,
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                padding: 2,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 10,
                border: '1px solid rgba(0,0,0,0.1)',
                maxWidth: { xs: '180px', sm: '240px' }
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Map Legend
              </Typography>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div className="legend-color" style={{
                  backgroundColor: '#FF0000',
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  marginRight: 8,
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                }} />
                <span style={{ fontSize: '0.875rem' }}>Your Location</span>
              </div>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div className="legend-color" style={{
                  backgroundColor: '#00C853',
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  marginRight: 8,
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                }} />
                <span style={{ fontSize: '0.875rem' }}>Nearest Center</span>
              </div>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="legend-color" style={{
                  backgroundColor: '#1976d2',
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  marginRight: 8,
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                }} />
                <span style={{ fontSize: '0.875rem' }}>Other Centers</span>
              </div>
            </Box>
          </Box>

          {error && (
            <Typography
              color="error"
              align="center"
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: 'error.light',
                color: 'error.contrastText'
              }}
            >
              {error}
            </Typography>
          )}

          {/* No Results Alert */}
          {noResults && (
            <Alert
              severity="info"
              variant="filled"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              No test centers found within {radius} miles of your location.
              Try increasing your search radius or searching for a different area.
            </Alert>
          )}
        </Box>
      </Fade>
    </Container>
  );
}

export default LandingMap;