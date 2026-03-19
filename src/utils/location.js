import { trackUserAction } from './auditHelper';

export const getLocation = (setLocation, user = null) => {
  const userId = user ? user.email : null;
  const trackingKey = userId || 'GUEST';

  // 1. OPTIMIZATION: Check if we already tracked them in this browser tab
  const sessionCacheKey = `kobs_location_tracked_${trackingKey}`;
  const cachedLocationData = sessionStorage.getItem(sessionCacheKey);

  if (cachedLocationData) {
    // We already tracked them! Just load the coordinates for the UI and stop.
    const parsedData = JSON.parse(cachedLocationData);
    setLocation({ latitude: parsedData.latitude, longitude: parsedData.longitude });
    console.log('Location loaded from session cache. Skipping audit track.');
    return; 
  }

  // Helper function to translate Lat/Lon into a real Street Address
  const fetchStreetAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      return data.address || {}; 
    } catch (error) {
      return {};
    }
  };

  const fetchLocationData = async (browserLat = null, browserLon = null) => {
    try {
      // Use ipify for IP address (CORS-friendly)
      let ipv4Address = 'Unknown';
      let geoData = {};

      try {
        const ipv4Response = await fetch('https://api.ipify.org?format=json');
        const ipv4Data = await ipv4Response.json();
        ipv4Address = ipv4Data.ip;
      } catch (e) {
        console.warn('Could not fetch IPv4 address');
      }

      // Try to get geolocation data from ip-api.com (CORS-friendly, free)
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ipv4Address}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone`);
        const data = await geoResponse.json();
        if (data.status === 'success') {
          geoData = data;
        }
      } catch (e) {
        console.warn('Could not fetch geolocation data from IP');
      }

      let fullAddress = {};
      if (browserLat && browserLon) {
        fullAddress = await fetchStreetAddress(browserLat, browserLon);
      }

      const finalData = {
        latitude: browserLat || geoData.lat || 0,
        longitude: browserLon || geoData.lon || 0,
        city: fullAddress.city || fullAddress.town || geoData.city || 'Unknown',
        state: fullAddress.state || geoData.regionName || 'Unknown',
        country: fullAddress.country || geoData.country || 'Unknown',
        zipCode: fullAddress.postcode || geoData.zip || 'Unknown',
        street: fullAddress.road || 'Unknown',
        neighborhood: fullAddress.suburb || fullAddress.neighbourhood || 'Unknown',
        defaultIp: ipv4Address,
        ipv4: ipv4Address
      };

      // Set the UI state
      setLocation({ latitude: finalData.latitude, longitude: finalData.longitude });
      
      // Save to Audit Service (MongoDB)
      logLocationToAudit(finalData, userId);

      // 2. OPTIMIZATION: Save the result to sessionStorage so we don't track on refresh!
      sessionStorage.setItem(sessionCacheKey, JSON.stringify(finalData));

    } catch (error) {
      console.error('Failed to fetch location data:', error);
    }
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        fetchLocationData(position.coords.latitude, position.coords.longitude);
      },
      error => {
        fetchLocationData(); 
      }
    );
  } else {
    fetchLocationData();
  }
};

const logLocationToAudit = (locationData, userId) => {
  const metadata = {
    ipAddress: locationData.defaultIp, 
    ipv4Address: locationData.ipv4,    
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    street: locationData.street,
    neighborhood: locationData.neighborhood,
    city: locationData.city,
    state: locationData.state,
    zipCode: locationData.zipCode,
    country: locationData.country
  };

  trackUserAction(userId, 'APP_OPENED_WITH_LOCATION', null, metadata);
};