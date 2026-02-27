import { trackUserAction } from './auditHelper';

export const getLocation = (setLocation, user = null) => {
  const userId = user ? user.email : null;

  const fetchLocationData = async (browserLat = null, browserLon = null) => {
    try {
      // 1. Fetch Geo Location Data
      const geoResponse = await fetch('https://ipapi.co/json/');
      const geoData = await geoResponse.json();

      // 2. Explicitly fetch IPv4
      let ipv4Address = 'Unknown';
      try {
        const ipv4Response = await fetch('https://api4.ipify.org?format=json');
        const ipv4Data = await ipv4Response.json();
        ipv4Address = ipv4Data.ip;
      } catch (ipv4Error) {
        console.warn('Could not fetch explicitly IPv4 address', ipv4Error);
      }

      // 3. Merge data
      const finalData = {
        latitude: browserLat || geoData.latitude,
        longitude: browserLon || geoData.longitude,
        city: geoData.city || 'Unknown',
        country: geoData.country_name || 'Unknown',
        defaultIp: geoData.ip || 'Unknown', 
        ipv4: ipv4Address                   
      };

      setLocation({ latitude: finalData.latitude, longitude: finalData.longitude });
      logLocationToAudit(finalData, userId);

    } catch (error) {
      console.error('Failed to fetch IP location data:', error);
      if (browserLat && browserLon) {
        logLocationToAudit({ latitude: browserLat, longitude: browserLon }, userId);
      }
    }
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        fetchLocationData(position.coords.latitude, position.coords.longitude);
      },
      error => {
        console.warn('User denied GPS or error occurred:', error);
        fetchLocationData(); 
      }
    );
  } else {
    fetchLocationData();
  }
};

const logLocationToAudit = (locationData, userId) => {
  const metadata = {
    ipAddress: locationData.defaultIp || 'Unknown', 
    ipv4Address: locationData.ipv4 || 'Unknown',    
    city: locationData.city || 'Unknown',
    country: locationData.country || 'Unknown',
    latitude: locationData.latitude,
    longitude: locationData.longitude
  };

  trackUserAction(userId, 'APP_OPENED_WITH_LOCATION', null, metadata);
};