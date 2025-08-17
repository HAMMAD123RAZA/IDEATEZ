// client/src/components/Get_A_Quote.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { db } from '../utils/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { logNotification } from '../utils/Notifications';
import NotificationModal from '../admin/components/NotificationModal'; // Import NotificationModal

const QuoteForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [submitSuccess, setSubmitSuccess] = useState(false); // Replaced by modal
  // const [error, setError] = useState(null); // Replaced by modal for submission errors

  const location = useLocation();
  const formTitle = location.state?.formTitle || "Get a Quote";
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    phone: '',
    service: ''
  });

  // State for NotificationModal
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info'); // 'info', 'success', 'error'

  const displayNotification = (title, message, type = 'info') => {
    setNotificationTitle(title);
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotificationModal(true);
  };

  const services = [
    'Web & App Development',
    'Digital Marketing',
    'Design & Development',
    'Digital Marketing Outsourcing',
    'Others'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowNotificationModal(false); // Clear previous notifications

    if (!formData.name || !formData.email) {
      displayNotification('Validation Error', 'Name and email are required.', 'error');
      setIsSubmitting(false);
      return;
    }

    const now = Timestamp.now(); 

    try {
      await addDoc(collection(db, 'Get_A_Quote'), {
        ...formData,
        phone: formData.phone,
        createdAt: now,
        isRead: false
      });

      await logNotification({
        subject: "New Quote Request",
        message: "User submitted quote form",
        date: now, 
        additionalData: {
          formData: formData,
          page: 'quote'
        }
      });
      
      displayNotification('Success', "Thank you for your message! We'll get back to you soon.", 'success');
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        phone: '',
        service: ''
      });
    } catch (error) {
      console.error('Error adding quote:', error);
      displayNotification('Error', 'Failed to submit form. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 p-4">
      <NotificationModal
          show={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          title={notificationTitle}
          message={notificationMessage}
          type={notificationType}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-900 rounded-lg shadow-xl p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">{formTitle}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <motion.input
              variants={inputVariants}
              whileFocus="focus"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <motion.input
              variants={inputVariants}
              whileFocus="focus"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
          <motion.input
            variants={inputVariants}
            whileFocus="focus"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onWheel={(e) => e.target.blur()}
            placeholder="Your number"
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          </div>

          <div>
            <motion.select
              variants={inputVariants}
              whileFocus="focus"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option disabled hidden value="">
                Select Required Service
              </option>
              {services.map((service, index) => (
                <option key={index} value={service}>
                  {service}
                </option>
              ))}
            </motion.select>
          </div>

          <div>
            <motion.input
              variants={inputVariants}
              whileFocus="focus"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company Name (Optional)"
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <motion.textarea
              variants={inputVariants}
              whileFocus="focus"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={formTitle}
              rows="4"
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#bf9b30] to-[#a67c00] text-gray-200 font-semibold py-3 px-8 rounded-lg hover:bg-yellow-500 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </motion.button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">We'll get back to you within 24 hours</p>
      </motion.div>
    </div>
  );
};

export default QuoteForm;