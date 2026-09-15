import axios from 'axios';

// I noticed your Expo server is running on 192.168.0.105
// So this is your computer's local IP address!
const BASE_URL = 'http://192.168.0.105:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
