// components/DoctorNotifications.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaCalendarAlt, 
  FaUser, 
  FaClock, 
  FaCheck, 
  FaTimes,
  FaEye,
  FaExclamationCircle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const DoctorNotifications = ({ isOpen, onClose }) => {
  const { apiRequest, isDoctor } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && isDoctor()) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/appointments/notifications');
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await apiRequest(`/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: { status }
      });

      if (response.success) {
        // Remove the notification from the list
        setNotifications(prev => prev.filter(notif => notif._id !== appointmentId));
        
        // Show success message
        // You can add a toast notification here
        console.log(`Appointment ${status} successfully`);
      }
    } catch (err) {
      console.error(`Error updating appointment status:`, err);
      // You can add error toast here
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isDoctor()) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-accent p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaBell className="mr-3 text-2xl" />
                  <h2 className="text-xl font-bold">New Appointment Requests</h2>
                  {notifications.length > 0 && (
                    <span className="ml-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-accent hover:text-white transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center py-12 text-red-500">
                  <FaExclamationCircle size={48} className="mb-4" />
                  <p className="text-lg font-semibold">Error loading notifications</p>
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={fetchNotifications}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Try Again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <FaBell size={48} className="mb-4" />
                  <p className="text-lg font-semibold">No new appointment requests</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((appointment) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-6 border-l-4 border-accent"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {/* Patient Info */}
                          <div className="flex items-center mb-3">
                            <FaUser className="text-primary mr-2" />
                            <h3 className="text-lg font-semibold text-primary">
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </h3>
                          </div>

                          {/* Appointment Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-gray-600">
                              <FaCalendarAlt className="mr-2" />
                              <span>{formatDate(appointment.appointmentDate)}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FaClock className="mr-2" />
                              <span>{formatTime(appointment.appointmentTime)}</span>
                            </div>
                          </div>

                          {/* Appointment Type */}
                          <div className="mb-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                            </span>
                          </div>

                          {/* Reason */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-1">Reason for Visit:</h4>
                            <p className="text-gray-600 text-sm">{appointment.reasonForVisit}</p>
                          </div>

                          {/* Symptoms */}
                          {appointment.symptoms && appointment.symptoms.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-700 mb-1">Symptoms:</h4>
                              <div className="flex flex-wrap gap-1">
                                {appointment.symptoms.map((symptom, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                                  >
                                    {symptom}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <FaCheck className="mr-2" />
                            Confirm
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <FaTimes className="mr-2" />
                            Decline
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <FaEye className="mr-2" />
                            View Details
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t">
                <button
                  onClick={fetchNotifications}
                  className="text-sm text-primary hover:text-blue-800 font-medium"
                >
                  Refresh Notifications
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DoctorNotifications;