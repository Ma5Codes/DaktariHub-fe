// components/BookingConfirmationModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarPlus, FaTimes, FaUser, FaStethoscope, FaClock, FaComments } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const BookingConfirmationModal = ({ 
  isOpen, 
  onClose, 
  doctor, 
  onConfirmBooking 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reasonForVisit: '',
    symptoms: '',
    type: 'consultation'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Appointment date must be in the future';
      }
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Appointment time is required';
    }

    if (!formData.reasonForVisit.trim()) {
      newErrors.reasonForVisit = 'Reason for visit is required';
    } else if (formData.reasonForVisit.trim().length < 10) {
      newErrors.reasonForVisit = 'Please provide more details (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const appointmentData = {
        doctorId: doctor.id,
        ...formData,
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : []
      };
      
      await onConfirmBooking(appointmentData);
      
      // Reset form
      setFormData({
        appointmentDate: '',
        appointmentTime: '',
        reasonForVisit: '',
        symptoms: '',
        type: 'consultation'
      });
      setErrors({});
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setErrors({});
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-primary text-accent p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaCalendarPlus className="mr-3 text-2xl" />
                  <h2 className="text-xl font-bold">Book Appointment</h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-accent hover:text-white transition-colors disabled:opacity-50"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Doctor Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <img 
                    src={doctor?.image || '/default-doctor.png'} 
                    alt={doctor?.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-primary flex items-center">
                      <FaStethoscope className="mr-2" />
                      {doctor?.name}
                    </h3>
                    <p className="text-gray-600">{doctor?.specialty}</p>
                    <p className="text-sm text-gray-500">
                      Experience: {doctor?.experience} years
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaUser className="mr-2" />
                  <span>Patient: {user?.firstName} {user?.lastName}</span>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaClock className="inline mr-2" />
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    min={minDate}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    required
                  />
                  {errors.appointmentDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.appointmentDate}</p>
                  )}
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Time *
                  </label>
                  <select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.appointmentTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select Time</option>
                    {generateTimeSlots().map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {errors.appointmentTime && (
                    <p className="mt-1 text-sm text-red-500">{errors.appointmentTime}</p>
                  )}
                </div>

                {/* Appointment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="routine-checkup">Routine Checkup</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaComments className="inline mr-2" />
                    Reason for Visit *
                  </label>
                  <textarea
                    name="reasonForVisit"
                    value={formData.reasonForVisit}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Please describe the reason for your visit..."
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none ${
                      errors.reasonForVisit ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.reasonForVisit && (
                      <p className="text-sm text-red-500">{errors.reasonForVisit}</p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {formData.reasonForVisit.length}/500
                    </p>
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms (Optional)
                  </label>
                  <input
                    type="text"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    placeholder="e.g., headache, fever, cough (separate with commas)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple symptoms with commas
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-accent text-primary rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      <>
                        <FaCalendarPlus className="mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingConfirmationModal;