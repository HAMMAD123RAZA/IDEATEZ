// client/src/components/portfolioBar.jsx

import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import React, { useState, useRef, useEffect } from 'react';
import { OrbitControls, useGLTF, Center, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard, Text } from '@react-three/drei';

// Import your 3D components
import { WorldMap } from './portfolio/WorldMap'; // id: 1
import { ShoeModel } from './portfolio/ShoeModel';
import { ParticleSystem } from './portfolio/ParticleSystem'; // id: 3
import { DNAHelix } from './portfolio/DNAHelix'; // id: 4
import { ParticleTorus } from './portfolio/ParticleTorus'; // id: 5

// NEW COMPONENTS — YOU CAN CREATE THESE FILES LATER
import { InteractiveWireframe } from './portfolio/InteractiveWireframe'; //id: 6
import { AiDashboard } from './portfolio/AiDashboard'; // id: 7
import { DynamicLandingPage } from './portfolio/DynamicLandingPage'; // id: 8
import { DataVisualizationTool } from './portfolio/DataVisualizationTool'; // id: 9
import { ProductConfigurator } from './portfolio/ProductConfigurator'; // id: 10
import { RealTimeCollaborationTool } from './portfolio/RealTimeCollaborationTool'; // id: 11
import { AugmentedRealityPreview } from './portfolio/AugmentedRealityPreview'; // id: 12
import { BrandIdentityVisualizer } from './portfolio/BrandIdentityVisualizer'; // id: 13
import { InteractiveInfographic } from './portfolio/InteractiveInfographic'; // id: 14
import { EcommercePlatform } from './portfolio/EcommercePlatform'; // id: 15
import { NftGallery } from './portfolio/NftGallery'; // id: 16
import { BlockchainExplorer } from './portfolio/BlockchainExplorer'; // id: 17
import { MotionDesignExploration } from './portfolio/MotionDesignExploration'; // id: 20

const PortfolioBar = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [activeTag, setActiveTag] = useState(null); // Only needed if using tags later

  // Define Categories
  const categories = [
    'All',
            '3D Models',
                    'Product Design',
    'kite Design',
    'Cube',
    'Rock',
    'Square',
    // '3D Models',
    // 'Product Design'
  ];

  // Define Projects (IDs 1–21)
  const projects = [

    // UI/UX Design
    {
      id: 1,
      category: 'kite Design',
      title: 'Interactive Mobile App Preview',
      description: 'Fully interactive 3D preview of a mobile app interface.',
      type: 'interactiveWireframe',
      tags: ['Mobile App', 'UI/UX', 'Interactive']
    },
    {
      id: 2,
      category: 'UI/UX Design',
      title: 'Responsive Dashboard Wireframe',
      description: '3D representation of a responsive admin dashboard design.',
      type: 'aiDashboard',
      tags: ['Dashboard', 'UI/UX', 'Responsive']
    },
    {
      id: 3,
      category: 'UI/UX Design',
      title: 'Scrollable Landing Page Prototype',
      description: 'Parallax scrolling landing page visualized in 3D space.',
      type: 'dynamicLandingPage',
      tags: ['Landing Page', 'Scroll Animation', 'Prototype']
    },

    // Web Development
    {
      id: 4,
      category: 'Cube',
      title: 'Custom CMS Interface',
      description: 'Interactive 3D view of a headless CMS interface.',
      type: 'dataVisualizationTool',
      tags: ['CMS', 'React', 'Admin Panel']
    },
    {
      id: 5,
      category: 'Cube',
      title: 'E-commerce Product Configurator',
      description: '3D product configurator built with real-time state updates.',
      type: 'productConfigurator',
      tags: ['E-commerce', 'React', 'Configuration Tool']
    },

    // Marketing Campaigns
    {
      id: 7,
      category: 'Rock',
      title: 'AR Social Media Filter Demo',
      description: '3D augmented reality filter prototype for social platforms.',
      type: 'augmentedRealityPreview',
      tags: ['AR', 'Social Media', 'Filter']
    },
    {
      id: 8,
      category: 'Rock',
      title: 'Brand Identity Visualizer',
      description: 'Interactive 3D brand style guide with color and logo variations.',
      type: 'brandIdentityVisualizer',
      tags: ['Branding', 'Color Theory', 'Logo Variants']
    },
    {
      id: 9,
      category: 'Rock',
      title: 'Interactive Infographic Experience',
      description: 'Animated data infographic rendered in 3D for campaign visuals.',
      type: 'interactiveInfographic',
      tags: ['Infographic', 'Data Visualization', 'Campaign']
    },

    // Case Studies
    {
      id: 10,
      category: 'Square',
      title: 'Enterprise E-commerce Redesign',
      description: 'Redesigned enterprise-level online store with improved UX flow.',
      type: 'ecommercePlatform',
      tags: ['E-commerce', 'UX Improvement', 'Case Study']
    },


    // Existing "3D Models" Projects
    {
      id: 6,
      category: '3D Models',
      title: 'Multi-user Collaboration Platform',
      description: '3D simulation of a real-time collaborative editing interface.',
      type: 'realTimeCollaborationTool',
      tags: ['Collaboration', 'WebRTC', 'Live Editing']
    },
    {
      id: 11,
      category: '3D Models',
      title: 'NFT Gallery for Digital Artists',
      description: '3D gallery for artists to showcase digital collectibles.',
      type: 'nftGallery',
      tags: ['NFT', 'Digital Art', 'Marketplace']
    },
    {
      id: 12,
      category: '3D Models',
      title: 'Decentralized Finance Explorer',
      description: '3D blockchain explorer interface for DeFi users.',
      type: 'blockchainExplorer',
      tags: ['DeFi', 'Blockchain', 'Finance']
    },
    {
      id: 13,
      category: '3D Models',
      title: 'Interactive Global Network',
      description: 'A 3D interactive world map visualization showing global connectivity...',
      type: 'worldMap',
      tags: ['World Map', 'Three.js', 'Data Visualization', 'Interactive']
    },
    {
      id: 15,
      category: '3D Models',
      title: 'Particle Physics Playground',
      description: 'Interactive particle system that simulates physical forces and emergent behaviors...',
      type: 'particles',
      tags: ['Particles', 'Physics Engine', 'Simulation']
    },
    {
      id: 16,
      category: '3D Models',
      title: 'DNA Helix Structure',
      description: 'A dynamic 3D representation of DNA double helix with glowing nucleotide pairs...',
      type: 'dna',
      tags: ['DNA', 'Biology', 'Molecular Structure']
    },
    {
      id: 17,
      category: '3D Models',
      title: 'Particle Torus System',
      description: 'A mesmerizing combination of floating particles and wireframe torus geometry...',
      type: 'particleTorus',
      tags: ['Particles', 'Geometry', 'Wireframe']
    },
    {
      id: 7,
      category: 'Product Design',
      title: 'Interactive Shoe Customizer',
      description: 'Customize colors of individual shoe parts interactively.',
      type: 'shoeModel',
      tags: ['3D Model', 'Product Design', 'Interactive']
    },
    {
      id: 20,
      category: '3D Models',
      title: 'Motion Design Portfolio Showcase',
      description: 'Creative portfolio experience with animated transitions.',
      type: 'motionDesignExploration',
      tags: ['Motion Design', 'Animation', 'Showcase']
    }
  ];

  // Filter projects based on selected category
  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(project => project.category === activeCategory);

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setCurrentProjectIndex(0); // Reset to first project in new category
    setActiveTag(null); // Clear any active tag filter
  };

  // Navigation handlers
  const goToNext = () => {
    if (currentProjectIndex < filteredProjects.length - 1) {
      setCurrentProjectIndex(currentProjectIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentProjectIndex > 0) {
      setCurrentProjectIndex(currentProjectIndex - 1);
    }
  };

  const is3DProject = () => {
    return filteredProjects.length > 0;
  };

  return (
    <div className="text-white p-8 min-w-[60vw] mx-auto my-20 rounded-lg">
      <h1 className="text-4xl font-bold text-center mb-10">Components</h1>

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`px-3 cursor-pointer sm:px-4 py-1 rounded-full transition-all ${activeCategory === category
                ? 'bg-yellow-600 text-gray-100'
                : 'bg-[#e8e4d8] text-gray-500'
              }  text-sm sm:text-lg font-medium`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Main 3D Viewer Container */}
      <div className="w-full max-w-5xl mx-auto aspect-video relative rounded-lg overflow-hidden bg-transparent border border-gray-200 shadow-sm">
        {filteredProjects.length > 0 && is3DProject() && (
          <motion.div
            key={filteredProjects[currentProjectIndex].id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Canvas
                camera={{ position: [0, 0, 10], fov: 50 }}
                gl={{ antialias: true }}
                className="w-full h-full"
              >
                {/* Lights */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                {/* Orbit Controls */}
                <OrbitControls
                  enableZoom autoRotate autoRotateSpeed={0.5}
                  minPolarAngle={Math.PI / 6}
                  maxPolarAngle={Math.PI - Math.PI / 6}
                />
                {/* <ThreeErrorBoundary> */}
                {/* Conditionally render correct 3D component */}
                <WorldMap visible={filteredProjects[currentProjectIndex].type === 'worldMap'} />
                <ParticleSystem visible={filteredProjects[currentProjectIndex].type === 'particles'} />
                <DNAHelix visible={filteredProjects[currentProjectIndex].type === 'dna'} />
                <ParticleTorus visible={filteredProjects[currentProjectIndex].type === 'particleTorus'} />

                {/* New Components */}
                <InteractiveWireframe visible={filteredProjects[currentProjectIndex].type === 'interactiveWireframe'} />
                <AiDashboard visible={filteredProjects[currentProjectIndex].type === 'aiDashboard'} />
                <DynamicLandingPage visible={filteredProjects[currentProjectIndex].type === 'dynamicLandingPage'} />
                <DataVisualizationTool visible={filteredProjects[currentProjectIndex].type === 'dataVisualizationTool'} />
                <ProductConfigurator visible={filteredProjects[currentProjectIndex].type === 'productConfigurator'} />
                <RealTimeCollaborationTool visible={filteredProjects[currentProjectIndex].type === 'realTimeCollaborationTool'} />
                <AugmentedRealityPreview visible={filteredProjects[currentProjectIndex].type === 'augmentedRealityPreview'} />
                <BrandIdentityVisualizer visible={filteredProjects[currentProjectIndex].type === 'brandIdentityVisualizer'} />
                <InteractiveInfographic visible={filteredProjects[currentProjectIndex].type === 'interactiveInfographic'} />
                <EcommercePlatform visible={filteredProjects[currentProjectIndex].type === 'ecommercePlatform'} />
                <NftGallery visible={filteredProjects[currentProjectIndex].type === 'nftGallery'} />
                <BlockchainExplorer visible={filteredProjects[currentProjectIndex].type === 'blockchainExplorer'} />
                <ShoeModel visible={filteredProjects[currentProjectIndex].type === 'shoeModel'} />
                <MotionDesignExploration visible={filteredProjects[currentProjectIndex].type === 'motionDesignExploration'} />
                {/* </ThreeErrorBoundary> */}
              </Canvas>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {currentProjectIndex > 0 && (
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10 px-2 sm:px-3 md:px-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrev}
              className="bg-yellow-800 hover:bg-yellow-700 text-white sm:p-3 md:p-4 rounded-full shadow-lg transition-all duration-300"
              aria-label="Previous Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          </div>
        )}


        {currentProjectIndex < filteredProjects.length - 1 && (
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10 px-2 sm:px-3 md:px-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNext}
              className="bg-yellow-800 hover:bg-yellow-700 text-white sm:p-3 md:p-4 rounded-full shadow-lg transition-all duration-300"
              aria-label="Next Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioBar;