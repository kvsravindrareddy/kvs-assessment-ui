// src/utils/location.js
import CONFIG from '../Config';

export const getLocation = (setLocation) => {
  const getIpLocation = () => {
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        setLocation({ latitude: data.latitude, longitude: data.longitude });
        sendLocationToApi(data.latitude, data.longitude);
      })
      .catch(error => console.error('IP location error:', error));
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ latitude: lat, longitude: lon });
        sendLocationToApi(lat, lon);
      },
      error => {
        console.warn('Geolocation error:', error);
        getIpLocation();
      }
    );
  } else {
    getIpLocation();
  }
};

const sendLocationToApi = (lat, lon) => {
  const url = `${CONFIG.development.EVALUATION_BASE_URL}/geo/locate?lat=${lat}&lon=${lon}`;
  fetch(url)
    .then(res => res.json())
    .then(data => console.log('Location sent:', data))
    .catch(error => console.error('Send location error:', error));
};
