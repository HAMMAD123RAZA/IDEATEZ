// client/src/components/Footer.jsx
import React from 'react';
import { FaDiscord, FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-transparent text-white py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* First Column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">IDEATEZ</h2>
            <img src="/IdLogo1.jpg" alt="Logo" className="w-40 h-auto mb-4 rounded-full" />
          </div>

          {/* Second Column */}
          <div className="flex flex-col items-center">
            <p className="text-lg font-medium mb-6">Let’s grow together by serving your niche.</p>
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300 }}>
                <FaDiscord size={24} />
              </motion.div>
              <motion.div whileHover={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300 }}>
                <FaTwitter size={24} />
              </motion.div>
              <motion.div whileHover={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300 }}>
                <FaFacebookF size={24} />
              </motion.div>
              <motion.div whileHover={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300 }}>
                <FaInstagram size={24} />
              </motion.div>
            </div>
          </div>

          {/* Third Column */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <Link to="/AboutUs" className="text-lg font-medium mb-4 hover:underline">About Us</Link>
            <Link to="/Get_A_Quote" className="text-lg font-medium mb-4 hover:underline">Join Us</Link>
            <Link to="/portfolio" className="text-lg font-medium mb-4 hover:underline">Portfolio</Link>
          </div>
        </div>

        {/* Copyright Row */}
        <div className="mt-6 border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>Copyright © 2025 All rights reserved by Digital Agency</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;