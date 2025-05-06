import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Auth endpoints
export const signUp = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to sign up. Please try again.' 
    };
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Invalid credentials. Please try again.' 
    };
  }
};

// BMI endpoints
export const calculateBMI = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/bmi`, data);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to calculate BMI. Please try again.' 
    };
  }
};

// Diet plan endpoints
export const getDietPlan = async (bmi) => {
  try {
    const response = await axios.get(`${API_URL}/diet-plan?bmi=${bmi}`);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get diet plan. Please try again.' 
    };
  }
};

export const generateDietPlan = async (bmi) => {
  try {
    const response = await axios.post(`${API_URL}/diet-plan`, { bmi });
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to generate diet plan. Please try again.' 
    };
  }
};

// Medical record endpoints
export const addMedicalRecord = async (recordData) => {
  try {
    const response = await axios.post(`${API_URL}/records`, recordData);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to add medical record. Please try again.' 
    };
  }
};

export const getMedicalRecords = async () => {
  try {
    const response = await axios.get(`${API_URL}/records`);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get medical records. Please try again.' 
    };
  }
}; 