import axios from 'axios';

const api = axios.create({
  baseURL: 'https://online-train-food-ordering-system-production.up.railway.app',
});

export default api;