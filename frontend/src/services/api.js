import axios from 'axios';
import API_BASE_URL from '../config'; 

const api = axios.create({
  baseURL: API_BASE_URL, // 👈 Use the variable (No more localhost!)
});

export default api;