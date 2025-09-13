// FILE: client/src/contacts/Cards.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ImageCard = ({ icon, title, content, delay }) => {
  return (
    <motion.div 
className="relative w-full max-w-xs sm:w-64 md:w-64 lg:w-64 h-32 rounded-lg overflow-hidden shadow-lg my-3 mx-auto sm:m-4 border border-cyan-500/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 5 }}
      whileHover={{ scale: 1.05 ,y:20}}
    >
      <div className="absolute inset-0 bg-[#e8e4d7] border-4 border-yellow-500
 text-gray-900 from-[#bf9b30] to-[#a67c00]  z-10"></div>
      
      {/* Icon */}
      <motion.div 
        className="absolute top-4 left-0 right-0 flex justify-center text-gray-900 z-20"
        whileHover={{ scale: 1.2, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>
      
      {/* Title */}
      <motion.div 
        className="absolute top-16 left-0 right-0 text-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
<h3 className="text-gray-900 text-base sm:text-lg font-bold">{title}</h3>
      </motion.div>
      
      {/* Content */}
      <motion.div 
        className="absolute bottom-4 left-0 right-0 text-center px-4 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4 }}
      >
<p className="text-gray-900 text-sm sm:text-base">{content}</p>
      </motion.div>
    </motion.div>
  );
};

const ContactCards = () => {
  const cards = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>,
      title: "Phone Number",
      content: "+92 3153743868"
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>,
      title: "Email Address",
      content: "hr7643157@gmail.com"
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>,
      title: "Business Hour",
      content: "Mon-Sat: 09:00 AM - 05:00 PM"
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>,
      title: "Office Address",
      content: "DHA-6 , Karachi , pakistan."
    }
  ];

  return (
    <div className="h-full text-gray-900  px-4 sm:px-6 lg:px-8">
      <motion.div 
className="max-w-7xl mx-auto px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-20 text-center text-gray-100 hover:text-gray-400">Contact</h1>
        
        </motion.div>
        
<div className="flex flex-wrap justify-center gap-4 sm:gap-0">
          {cards.map((card, index) => (
            <ImageCard 
              key={index}
              icon={card.icon}
              title={card.title}
              content={card.content}
              delay={index * 0.15}
            />
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
        
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContactCards;