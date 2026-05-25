import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error("Token verification failed, logging out:", error);
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const parseErrorMessage = (error, defaultMsg) => {
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (Array.isArray(detail)) {
        return detail.map(err => err.msg || JSON.stringify(err)).join(', ');
      }
      return detail;
    }
    return defaultMsg;
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // Fetch user profile immediately
      const profileResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      setCurrentUser(profileResponse.data);
      return { success: true, message: `Welcome back, ${profileResponse.data.name}!` };
    } catch (error) {
      const errorMsg = parseErrorMessage(error, 'Incorrect password or no account found with this email.');
      return { success: false, message: errorMsg };
    }
  };

  // Register function
  const register = async (name, email, password, branch, year) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
        branch,
        year,
        avatar: "", // Handled server-side if blank
        college_id: "" // Handled server-side if blank
      });
      
      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem('token', access_token);
        
        // Fetch user profile immediately
        const profileResponse = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        setCurrentUser(profileResponse.data);
      }

      return { 
        success: true, 
        message: response.data.message || "Registration successful! Logging you in..."
      };
    } catch (error) {
      throw error;
    }
  };

  // Google Login function
  const googleLogin = async (googleToken, email, name) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/google-login`, {
        token: googleToken,
        email,
        name
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // Fetch user profile immediately
      const profileResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      setCurrentUser(profileResponse.data);
      return { success: true, message: `Successfully authenticated with Google as ${profileResponse.data.name}!` };
    } catch (error) {
      const errorMsg = parseErrorMessage(error, 'Google authentication failed.');
      return { success: false, message: errorMsg };
    }
  };

  // Verify OTP function
  const verifyOtp = async (email, otp) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // Fetch user profile
      const profileResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      setCurrentUser(profileResponse.data);
      return { 
        success: true, 
        message: `OTP verified successfully! Welcome, ${profileResponse.data.name}.` 
      };
    } catch (error) {
      const errorMsg = parseErrorMessage(error, 'OTP verification failed. Check the code and try again.');
      return { success: false, message: errorMsg };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    return { success: true, message: 'Logged out successfully.' };
  };

  // Simple compatibility placeholder for manual verify student verification
  const verifyCurrentStudent = async (email) => {
    if (!currentUser) return false;
    try {
      const updatedUser = { ...currentUser, is_verified: true, email };
      setCurrentUser(updatedUser);
      return true;
    } catch (error) {
      console.error("Verification failed:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      register,
      googleLogin,
      verifyOtp,
      logout,
      verifyCurrentStudent
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
