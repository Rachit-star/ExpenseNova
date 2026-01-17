import API_BASE_URL from "../config";
import axios from 'axios';

const API_URL = `${API_BASE_URL}/api/auth/`; 
// Helper to handle responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  // 🔴 CRITICAL CHECK: If status is not 200-299, THROW ERROR
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.response = { data }; // Attach data so frontend can read the message
    throw error;
  }
  
  return data;
};

const register = async (name, email, password) => {
  try {
    const response = await fetch(API_URL + 'signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

const login = async (email, password) => {
  try {
    const response = await fetch(API_URL + 'login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const authService = {
  register,
  logout,
  login,
};

export default authService;