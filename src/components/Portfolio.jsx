// client/src/components/Portfolio.jsx

import React from 'react';
import { motion, stagger, useAnimation } from 'framer-motion';

const Portfolio = () => {
  const projects = [
    {
      id: 1,
      title: 'Project 1',
      description: 'lorem ipsum dolor smit swing ahsdi 1.',
      image: 'digi_agency.png',
      link: '#',
    },
    {
      id: 2,
      title: 'Project 2',
      description: 'lorem ipsum dolor smit swing ahsdi 2.',
      image: 'digi_agency.png',
      link: '#',
    },
    {
      id: 3,
      title: 'Project 3',
      description: 'lorem ipsum dolor smit swing ahsdi 3.',
      image: 'digi_agency.png',
      link: '#',
    },
    {
      id: 4,
      title: 'Project 4',
      description: 'lorem ipsum dolor smit swing ahsdi 4.',
      image: 'digi_agency.png',
      link: '#',
    },
    {
      id: 5,
      title: 'Project 5',
      description: 'lorem ipsum dolor smit swing ahsdi 5.',
      image: 'digi_agency.png',
      link: '#',
    },
    {
      id: 6,
      title: 'Project 6',
      description: 'lorem ipsum dolor smit swing ahsdi 6.',
      image: 'digi_agency.png',
      link: '#',
    },
  ];

  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        duration: 0.8,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 300,
      },
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 300,
      },
    },
  };

  return (
    <motion.section
      className="py-12"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl text-white font-bold text-center mb-8">Our Work Speaks for Itself</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
              initial="offscreen"
              whileInView="onscreen"
              whileHover="hover"
              viewport={{ once: true, amount: 0.8 }}
              variants={cardVariants}
              custom={index}
            >
              <motion.div
                className="overflow-hidden"
                variants={imageVariants}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              </motion.div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <motion.a
                  href={project.link}
                  className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  View Project
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Portfolio;
