import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import PasswordStrengthBar from 'react-password-strength-bar';
import axios from 'axios';
import LoginContext from '../context/LoginContext';

const SignUp = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        selectedVal: '',
        phoneNumber: '',
        age: '', // Added age field that was missing
        file: null,
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isLoggedIn } = useContext(LoginContext);

    // Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn || localStorage.getItem('authToken')) {
            navigate('/home');
        }
    }, [isLoggedIn, navigate]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData({ ...formData, [name]: type === 'file' ? files[0] : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.selectedVal || !formData.phoneNumber) {
            alert('Please fill in all required fields');
            setLoading(false);
            return;
        }

        const formDataToSend = {
            name: formData.fullName,
            email: formData.email,
            password: formData.password, // Include password in the request
            gender: formData.selectedVal,
            mobile: formData.phoneNumber,
            age: formData.age || 0, // Provide default value for age
            role: formData.selectedVal === 'doctor' ? 'doctor' : 'patient', // Send role based on selection
        };

        try {
            const response = await axios.post('http://localhost:6005/api/patients/register', formDataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout
            });

            console.log('Patient registered successfully:', response.data);
            
            if (response.data.message || response.data.newPatient) {
                // Store user name and role for later use
                localStorage.setItem('userName', formData.fullName);
                localStorage.setItem('userRole', formData.selectedVal === 'doctor' ? 'doctor' : 'patient');
                
                alert('Patient registered successfully! Please login with your credentials.');
                navigate('/login');
            }

            // Reset form
            setFormData({
                fullName: '',
                email: '',
                password: '',
                selectedVal: '',
                phoneNumber: '',
                age: '',
                file: null,
            });

        } catch (error) {
            console.error('Error during registration:', error.response?.data || error.message);
            
            if (error.code === 'ECONNABORTED') {
                alert('Request timed out. Please check your connection and try again.');
            } else if (error.response?.status === 409) {
                alert('User already exists with this email.');
            } else {
                alert(`Registration failed: ${error.response?.data?.message || error.message}`);
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
                <h2 className="text-3xl font-bold text-primary mb-6 text-center">Sign Up for DaktariHub</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="johndoe@example.com"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
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
                        <PasswordStrengthBar password={formData.password} />
                    </div>
                    
                    <div>
                        <label htmlFor="selection" className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <div className="relative">
                            <select
                                id="selection"
                                name="selectedVal"
                                value={formData.selectedVal}
                                onChange={handleChange}
                                className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            >
                                <option value="" disabled>Select Role</option>
                                <option value="doctor">Doctor</option>
                                <option value="patient">Patient</option>
                            </select>
                        </div>
                    </div>
                    
                    {formData.selectedVal === 'doctor' && (
                        <div>
                            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Upload Certificate (PDF) *</label>
                            <input
                                type="file"
                                id="file"
                                name="file"
                                accept="application/pdf"
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="25"
                            min="1"
                            max="120"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <div className="relative">
                            <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="+254 712 345 678"
                                required
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold py-2 px-4 rounded-md transition duration-300 ${
                            loading 
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : 'bg-accent text-primary hover:bg-primary hover:text-accent'
                        }`}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:underline">
                        Log in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default SignUp;
