// client/src/components/Contact.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Cards from '../contacts/Cards';
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'Get_A_Quote'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        createdAt: new Date()
      });
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-6 text-white">
        <Cards />

        <div className="flex flex-col md:flex-row">
          <motion.div
            className="w-full md:w-1/2 p-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-[#ffcf40]">Your Needs, Our Priority</h2>
            <p className='mb-4 text-justify'>
              We don't just create solutions, we craft experiences that drive results.
            </p>

            <h2 className="text-lg font-bold mb-4 text-[#ffcf40]">Why Choose Us?</h2>
            
            <ul className="list-disc pl-5 mb-4">
              <li className="text-base">
                <strong className="font-bold">Tailored Solutions</strong>: We listen, understand, and design strategies that align perfectly with your goals. No cookie-cutter approaches—just custom-built strategies for maximum impact.
              </li>

              <li className="text-base">
                <strong className="font-bold">Dedicated Support </strong>Our team doesn't just work for you; we work with you. From brainstorming to execution, we're by your side, ensuring seamless collaboration.
              </li>
              <li className="text-base">
                <strong className="font-bold">Proven Expertise </strong> : With years of experience in digital transformation, we bring innovation and expertise to every project, helping businesses like yours thrive in today's competitive landscape.
              </li>
            </ul>
            
            <h2 className="text-lg font-bold mb-4 text-[#ffcf40]">Let's Transform Your Vision Into Reality</h2>
            <p className='mb-4 text-justify'>
              Ready to take your business to the next level? Get in touch with us today for a free consultation.
            </p>
          </motion.div>

          <motion.div
            className="w-full md:w-1/2 p-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">Contact Us</h2>
            {submitSuccess && (
              <div className="mb-4 p-3 bg-yellow-500 text-white rounded">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white">Name</label>
                <input 
                  required 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-white" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Email</label>
                <input 
                  required 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-white" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Phone</label>
                <input 
                  required 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-white" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-white"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-yellow-600 text-white w-full cursor-pointer font-semibold p-2 rounded-lg hover:bg-yellow-700 transition-all duration-300 hover:scale-101 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Contact;