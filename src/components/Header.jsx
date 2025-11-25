import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignInAlt, FaBars, FaTimes, FaSignOutAlt, FaBell } from 'react-icons/fa';
import Logo from '../assets/logo.svg';
import LoginContext from '../context/LoginContext';
import { useAuth } from '../context/AuthContext';
import DoctorNotifications from './DoctorNotifications';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('/');
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, setIsLoggedIn } = useContext(LoginContext);
    const { apiRequest, isDoctor } = useAuth();

    useEffect(() => {
        setActiveItem(location.pathname);
        // Get user name and role from localStorage
        const storedUserName = localStorage.getItem('userName');
        const storedUserRole = localStorage.getItem('userRole');
        if (storedUserName) {
            setUserName(storedUserName);
        }
        if (storedUserRole) {
            setUserRole(storedUserRole);
        }
    }, [location]);

    // Fetch notification count for doctors
    useEffect(() => {
        const fetchNotificationCount = async () => {
            if (isDoctor() && isAuthenticated) {
                try {
                    const response = await apiRequest('/appointments/notifications');
                    if (response.success) {
                        setNotificationCount(response.data.length);
                    }
                } catch (error) {
                    console.error('Error fetching notification count:', error);
                }
            }
        };

        fetchNotificationCount();
        
        // Set up polling for notifications every 30 seconds
        const interval = setInterval(fetchNotificationCount, 30000);
        
        return () => clearInterval(interval);
    }, [isDoctor, isAuthenticated]);

    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        
        // Update login context
        setIsLoggedIn(false);
        
        // Redirect to login page
        navigate('/login');
    };

    // Define navigation items based on user role
    const getNavItems = () => {
        const baseItems = [
            { title: 'Home', path: '/home' },
            { title: 'Doctors', path: '/doctors' },
            { title: 'About', path: '/about-us' },
            { title: 'Contact', path: '/contact-us' },
        ];

        if (userRole === 'doctor') {
            return [
                ...baseItems,
                { title: 'Appointments', path: '/appointments' },
                { title: 'Patients', path: '/patients' },
            ];
        }

        return baseItems;
    };

    const navItems = getNavItems();

    // Check if user is authenticated
    const isAuthenticated = isLoggedIn || localStorage.getItem('authToken');

    return (
        <header className="bg-gradient-to-r from-primary to-secondary py-3 px-4">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <Link to="/home" className="flex items-center space-x-2">
                        <img src={Logo} alt="Health Nest Logo" className="h-10 w-auto" />
                        <span className="text-2xl font-bold text-accent">DaktariHub</span>
                    </Link>

                    {isAuthenticated && (
                        <nav className="hidden md:flex space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative px-3 py-2 text-base font-medium text-light hover:text-accent transition-colors duration-300 ${
                                        activeItem === item.path ? 'text-accent' : ''
                                    }`}
                                >
                                    {item.title}
                                    {activeItem === item.path && (
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                            layoutId="underline"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    )}

                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            // Show user profile when logged in
                            <div className="flex items-center space-x-3">
                                {isDoctor() && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowNotifications(true)}
                                            className="relative bg-accent/20 p-2 rounded-full hover:bg-accent/30 transition duration-300"
                                        >
                                            <FaBell className="text-accent text-lg" />
                                            {notificationCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {notificationCount > 9 ? '9+' : notificationCount}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2 bg-accent/20 px-3 py-1.5 rounded-full">
                                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                                        <FaUser className="text-primary text-sm" />
                                    </div>
                                    <div className="text-light text-sm">
                                        <div className="font-medium">Welcome, {userName || 'User'}</div>
                                        <div className="text-xs opacity-75 capitalize">{userRole || 'User'}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="bg-light text-primary px-4 py-1.5 rounded-full hover:bg-accent transition duration-300 text-sm font-medium"
                                >
                                    <FaSignOutAlt className="inline-block mr-1" />Logout
                                </button>
                            </div>
                        ) : (
                            // Show signup/login when not logged in
                            <>
                                <Link to="/signup" className="bg-accent text-primary px-4 py-1.5 rounded-full hover:bg-light transition duration-300 text-sm font-medium">
                                    <FaUser className="inline-block mr-1" />Sign Up
                                </Link>
                                <Link to="/login" className="bg-light text-primary px-4 py-1.5 rounded-full hover:bg-accent transition duration-300 text-sm font-medium">
                                    <FaSignInAlt className="inline-block mr-1" />Log In
                                </Link>
                            </>
                        )}
                    </div>

                    <button 
                        className="md:hidden text-light focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden mt-3"
                        >
                            {isAuthenticated ? (
                                // Mobile menu for authenticated users
                                <>
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`block py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300 ${
                                                activeItem === item.path ? 'text-accent' : ''
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                    <div className="border-t border-accent/30 mt-2 pt-2">
                                        <div className="px-3 py-2 text-light text-sm">
                                            <div>Welcome, {userName || 'User'}</div>
                                            <div className="text-xs opacity-75 capitalize">{userRole || 'User'}</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="block w-full text-left py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300"
                                        >
                                            <FaSignOutAlt className="inline-block mr-1" />Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Mobile menu for non-authenticated users
                                <>
                                    <Link
                                        to="/signup"
                                        className="block py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <FaUser className="inline-block mr-1" />Sign Up
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="block py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <FaSignInAlt className="inline-block mr-1" />Log In
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Doctor Notifications Modal */}
            <DoctorNotifications
                isOpen={showNotifications}
                onClose={() => {
                    setShowNotifications(false);
                    // Refresh notification count when modal closes
                    if (isDoctor() && isAuthenticated) {
                        setTimeout(async () => {
                            try {
                                const response = await apiRequest('/appointments/notifications');
                                if (response.success) {
                                    setNotificationCount(response.data.length);
                                }
                            } catch (error) {
                                console.error('Error refreshing notification count:', error);
                            }
                        }, 500);
                    }
                }}
            />
        </header>
    );
};

export default Header;
