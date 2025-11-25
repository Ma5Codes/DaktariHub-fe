import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import LoginContext from "../context/LoginContext";

const Login = () => {
  const { setIsLoggedIn } = useContext(LoginContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      navigate('/home');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.email || !formData.password) {
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('Login successful:', response.data);

      if (response.data.data && response.data.data.accessToken) {
        // Store the token in localStorage for future requests
        localStorage.setItem('authToken', response.data.data.accessToken);
        localStorage.setItem('userEmail', formData.email);
        
        // Store user information from response
        if (response.data.data.user) {
          localStorage.setItem('userName', response.data.data.user.name);
          localStorage.setItem('userRole', response.data.data.user.role);
        }
        
        // Store profile information if available
        if (response.data.data.profile) {
          localStorage.setItem('userProfile', JSON.stringify(response.data.data.profile));
        }

        // Update login state first
        setIsLoggedIn(true);
        
        // Reset form
        setFormData({
          email: "",
          password: "",
        });

        // Show success message and navigate
        console.log('Token stored successfully:', localStorage.getItem('authToken'));
        console.log('Redirecting to home...');
        
        // Navigate immediately since token is now stored
        navigate('/home', { replace: true });
      } else {
        console.error('Token not found in response:', response.data);
        alert('Login failed: No token received');
      }

    } catch (error) {
      console.error('Error during login:', error.response?.data || error.message);

      if (error.code === 'ECONNABORTED') {
        alert('Request timed out. Please check your connection and try again.');
      } else if (error.response?.status === 400) {
        alert('Invalid credentials. Please check your email and password.');
      } else {
        alert(`Login failed: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="bg-light min-h-screen flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
    >
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">
        Login to Daktari Hub
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="youremail@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center ${
            loading
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-accent text-primary hover:bg-primary hover:text-accent'
          }`}
        >
          <FaSignInAlt className="mr-2" />
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </motion.div>
  </div>
);
};

export default Login;
