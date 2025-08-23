export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const kmDistance = R * c;
  return kmDistance * 0.621371; // Convert to miles
}

export function createClusterMarker(coordinates, pointCount, map) {
  const el = document.createElement('div');
  el.className = 'marker-cluster';
  el.style.width = `${Math.min(pointCount * 8 + 20, 50)}px`;
  el.style.height = `${Math.min(pointCount * 8 + 20, 50)}px`;
  el.innerHTML = pointCount;
  return el;
}

export function formatDistance(distance) {
  return distance < 0.1 ? 
    'Less than 0.1 miles' : 
    `${distance.toFixed(1)} miles`;
}

export function validatePostcode(postcode) {
  // UK postcode regex pattern
  const postcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return postcodePattern.test(postcode.trim());
}

export function getBoundsFromCoordinates(coordinates) {
  if (!coordinates.length) return null;
  
  const bounds = coordinates.reduce((bounds, coord) => {
    return {
      minLng: Math.min(bounds.minLng, coord[0]),
      maxLng: Math.max(bounds.maxLng, coord[0]),
      minLat: Math.min(bounds.minLat, coord[1]),
      maxLat: Math.max(bounds.maxLat, coord[1])
    };
  }, {
    minLng: coordinates[0][0],
    maxLng: coordinates[0][0],
    minLat: coordinates[0][1],
    maxLat: coordinates[0][1]
  });
  
  return [[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]];
}