// client/src/components/About.jsx

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const WhoWeAreSection = () => {
  const agencyInfo = {
    description: "We're a forward-thinking digital agency passionate about crafting innovative solutions that drive real results. Our team of experts combines creativity and technical expertise to deliver exceptional digital experiences.",
    founder: {
      name: "HAMMAD RAZA",
      role: "Founder & CEO",
      message: "Our mission is to empower businesses through technology and design. We believe in creating digital experiences that not only look beautiful but also deliver measurable value.",
      image: "https://www.cio.com/wp-content/uploads/2024/01/shutterstock_1095953582.jpg?quality=50&strip=all&w=1024"
    },
    metrics: [
      { value: "20+", label: "Expert Business Consultation Team" },
      { value: "5+ Tools Mastered", label: "Tech Stack Expertise" },
      { value: "Real-Time Analytics", label: "Data Driven Consultation" },
      { value: "Global Collaboration", label: "Borderless Creativity" },
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="text-center mb-12"
        >

          <motion.h2 
            variants={itemVariants} 
            className="text-4xl md:text-5xl font-bold mb-20 text-center text-gray-100 hover:text-gray-400"
          >
            About Us
          </motion.h2>
          <motion.p 
            variants={itemVariants} 
            className="text-lg text-gray-100 max-w-3xl mx-auto"
          >
            {agencyInfo.description}
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16"
        >
          <motion.div variants={itemVariants} className="w-full md:w-1/3">
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img 
                src={agencyInfo.founder.image} 
                alt={agencyInfo.founder.name} 
                className="w-full h-auto"
              />
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white"
              >
                <h3 className="font-bold text-xl">{agencyInfo.founder.name}</h3>
                <p className="text-sm">{agencyInfo.founder.role}</p>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="w-full md:w-2/3 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-[#e8e4d7] border-4 border-yellow-500 border-4 border-yellow-500 p-6 rounded-xl text-gray-900 shadow-md"
            >
              <h3 className="text-xl font-semibold mb-3 text-gray-900">A Message from Our Founder</h3>
              <p className="text-gray-900 italic mb-4">"{agencyInfo.founder.message}"</p>
              
            </motion.div>

          </motion.div>
          
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-4"
        >
          {agencyInfo.metrics.map((metric, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="bg-[#e8e4d7] border-4 border-yellow-500   from-[#bf9b30] to-[#a67c00] rounded-xl p-6 text-center text-gray-900 shadow-lg"
            >
              <motion.h3 
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4, type: "spring" }}
                className="md:text-2xl text-lg font-bold mb-2"
              >
                {metric.value}
              </motion.h3>
              <p className="text-sm md:text-base">{metric.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;