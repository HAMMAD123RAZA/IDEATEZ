// client/src/components/portfolioBar_old.jsx

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';



// Custom Error Boundary for Three.js


const ThreeErrorBoundary = ({ children }) => {
  return <>{children}</>;
};

// New 3D Model: Particle Torus System
const ParticleTorus = ({ visible, scale = 1 }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.001;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group} scale={[3,3,3]}>
      {/* Particle system */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={new Float32Array(
              [...Array(1000 * 3)].map(() => (Math.random() - 0.5) * 5)
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.005}
          color="#5588ff"
          transparent
          alphaTest={0.01}
        />
      </points>

      {/* Torus */}
      <mesh>
        <torusGeometry args={[1, 0.3, 16, 100]} />
        <meshBasicMaterial
          color="#ff3366"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// 3D World Map Component
const WorldMap = ({ visible }) => {
  const group = useRef();

  useFrame((state) => {
    if (group.current) {
      group.current.scale.set(.80, .80, .80); // Scale up by 50%
      group.current.rotation.y += 0.001;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          color="#1E88E5"
          metalness={0.2}
          roughness={0.8}
          emissive="#0D47A1"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Continents */}
      {[
        { position: [0, 0, 5], size: [2, 1.5, 0.1], rotation: [0, 0, 0] }, // Europe
        { position: [2, 2, 4.5], size: [3, 2, 0.1], rotation: [0.2, 0.3, 0] }, // Asia
        { position: [-2, -2, 4.5], size: [1.5, 2, 0.1], rotation: [-0.2, -0.3, 0] }, // Africa
        { position: [-4, 2, 3], size: [2, 1.5, 0.1], rotation: [0.2, -0.5, 0] }, // North America
        { position: [-3, -1, 4], size: [1.5, 1, 0.1], rotation: [-0.1, -0.4, 0] }, // South America
        { position: [4, -3, 3], size: [1, 0.8, 0.1], rotation: [-0.3, 0.5, 0] }, // Australia
      ].map((continent, i) => (
        <mesh
          key={i}
          position={continent.position}
          rotation={continent.rotation}
        >
          <boxGeometry args={continent.size} />
          <meshStandardMaterial
            color="#4CAF50"
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Connection lines */}
      {[...Array(12)].map((_, i) => {
        const startAngle = Math.random() * Math.PI * 2;
        const endAngle = startAngle + (Math.random() * Math.PI);
        const radius = 5.1;

        const start = new THREE.Vector3(
          Math.cos(startAngle) * radius,
          (Math.random() - 0.5) * 5,
          Math.sin(startAngle) * radius
        );

        const end = new THREE.Vector3(
          Math.cos(endAngle) * radius,
          (Math.random() - 0.5) * 5,
          Math.sin(endAngle) * radius
        );

        const points = [start, end];

        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                count={points.length}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#FFC107" linewidth={1} />
          </line>
        );
      })}

      {/* Glowing points */}
      {[...Array(20)].map((_, i) => {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const radius = 5.1;

        const x = radius * Math.sin(theta) * Math.cos(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(theta);

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color="#FFEB3B"
              emissive="#FFEB3B"
              emissiveIntensity={2}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Crystal Structure Component
const CrystalStructure = ({ visible }) => {
  const group = useRef();

  useFrame((state) => {
    if (group.current) {
      group.current.scale.set(.9,.9,.9)
      group.current.rotation.y += 0.002;
      group.current.rotation.z += 0.001;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      {[...Array(20)].map((_, i) => {
        const angle = i / 20 * Math.PI * 2;
        const height = (i % 5 - 2) * 1.5;
        const radius = 3 + Math.sin(i * 0.5) * 0.5;

        const x = Math.cos(angle) * radius;
        const y = height;
        const z = Math.sin(angle) * radius;

        return (
          <mesh key={i} position={[x, y, z]}>
            <octahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.8}
              roughness={0.2}
              emissive="#4A148C"
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}

      {/* Central structure */}
      <mesh>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial
          color="#E13333"
          metalness={0.9}
          roughness={0.1}
          transparent={true}
          opacity={0.7}
        />
      </mesh>

      {[...Array(20)].map((_, i) => {
        const angle = i / 20 * Math.PI * 2;
        const height = (i % 5 - 2) * 1.5;
        const radius = 3 + Math.sin(i * 0.5) * 0.5;

        const x = Math.cos(angle) * radius;
        const y = height;
        const z = Math.sin(angle) * radius;

        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x * 0.5, y * 0.5, z * 0.5),
          new THREE.Vector3(x, y, z)
        ];

        const curve = new THREE.QuadraticBezierCurve3(
          points[0],
          points[1],
          points[2]
        );

        const curvePoints = curve.getPoints(20);

        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array(curvePoints.flatMap(p => [p.x, p.y, p.z]))}
                count={curvePoints.length}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#931452" linewidth={1} />
          </line>
        );
      })}
    </group>
  );
};

const ParticleSystem = ({ visible }) => {
  const group = useRef();
  const particles = useRef([]);

  useEffect(() => {
    particles.current = [...Array(200)].map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      size: Math.random() * 0.1 + 0.05,
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
    }));
  }, []);

  useFrame(() => {
    if (!group.current || !visible) return;

    group.current.rotation.y += 0.001;

    particles.current.forEach(particle => {
      particle.position.add(particle.velocity);

      if (particle.position.length() > 5) {
        particle.velocity.negate();
      }
    });
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      {particles.current.map((particle, i) => (
        <mesh key={i} position={particle.position.toArray()}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={1}
          />
        </mesh>
      ))}

      <mesh>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial
          color="#FF5722"
          metalness={0.5}
          roughness={0.5}
          emissive="#BF360C"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

// New 3D Model: DNA Helix Structure
const DNAHelix = ({ visible }) => {
  const group = useRef();
  const particles = useRef([]);

  useEffect(() => {
    // Create particles for the DNA strands
    particles.current = [];
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 10;
      const radius = 1.5;
      const height = (i / 10) - 5;

      // First strand
      particles.current.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        size: 0.2
      });

      // Second strand (opposite side)
      particles.current.push({
        position: new THREE.Vector3(
          Math.cos(angle + Math.PI) * radius,
          height,
          Math.sin(angle + Math.PI) * radius
        ),
        size: 0.2
      });
    }
  }, []);

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.005;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      {/* DNA strands */}
      {particles.current.map((particle, i) => (
        <mesh key={i} position={particle.position.toArray()}>
          <sphereGeometry args={[particle.size, 16, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#00BCD4" : "#FF4081"}
            emissive={i % 2 === 0 ? "#00838F" : "#C2185B"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Connecting lines */}
      {[...Array(50)].map((_, i) => {
        const angle1 = (i / 50) * Math.PI * 10;
        const angle2 = angle1 + Math.PI;
        const height = (i / 5) - 5;
        const radius = 1.5;

        const point1 = new THREE.Vector3(
          Math.cos(angle1) * radius,
          height,
          Math.sin(angle1) * radius
        );

        const point2 = new THREE.Vector3(
          Math.cos(angle2) * radius,
          height + 0.2,
          Math.sin(angle2) * radius
        );

        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([...point1.toArray(), ...point2.toArray()])}
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#9C27B0" linewidth={1} />
          </line>
        );
      })}

      {/* Central axis */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 10, 32]} />
        <meshStandardMaterial
          color="#4CAF50"
          emissive="#2E7D32"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

const PortfolioBar = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const group = useRef();

  const categories = ['All', '3D Models'];

  const projects = [
    {
      id: 1,
      category: '3D Models',
      title: 'Interactive Global Network',
      description: 'A 3D interactive world map visualization showing global connectivity...',
      type: 'worldMap',
      tags: ['World Map', 'Three.js', 'Data Visualization', 'Interactive']
    },
    {
      id: 2,
      category: '3D Models',
      title: 'Crystal Formation Simulator',
      description: 'An immersive 3D crystalline structure that demonstrates geometric patterns...',
      type: 'crystal',
      tags: ['Crystal', 'Procedural Generation', 'Physics Simulation']
    },
    {
      id: 3,
      category: '3D Models',
      title: 'Particle Physics Playground',
      description: 'Interactive particle system that simulates physical forces and emergent behaviors...',
      type: 'particles',
      tags: ['Particles', 'Physics Engine', 'Simulation']
    },
    {
      id: 4,
      category: '3D Models',
      title: 'DNA Helix Structure',
      description: 'A dynamic 3D representation of DNA double helix with glowing nucleotide pairs...',
      type: 'dna',
      tags: ['DNA', 'Biology', 'Molecular Structure']
    },
   
    {
      id: 5,
      category: '3D Models',
      title: 'Particle Torus System',
      description: 'A mesmerizing combination of floating particles and wireframe torus geometry...',
      type: 'particleTorus',
      tags: ['Particles', 'Geometry', 'Wireframe']
    }
  ];

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(project => project.category === activeCategory);

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setCurrentProjectIndex(0);
    setActiveTag(null);
  };

  const goToNext = () => {
    if (currentProjectIndex < filteredProjects.length - 1) {
      setCurrentProjectIndex(currentProjectIndex + 1);
      setActiveTag(null);
    }
  };

  const goToPrev = () => {
    if (currentProjectIndex > 0) {
      setCurrentProjectIndex(currentProjectIndex - 1);
      setActiveTag(null);
    }
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag === activeTag ? null : tag);

    // Find project index with this tag
    const projectIndex = filteredProjects.findIndex(project =>
      project.tags.includes(tag)
    );

    if (projectIndex !== -1) {
      setCurrentProjectIndex(projectIndex);
    }
  };

  const is3DProject = () => {
    if (filteredProjects.length === 0) return false;
    return true; // All projects are 3D now
  };



  return (
    <div className="text-white p-8 min-w-[60vw] mx-auto my-20 rounded-lg">
      <h1 className="text-4xl font-bold text-center mb-10"> Components </h1>

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`px-3 sm:px-4 py-1 rounded-full transition-all ${
              activeCategory === category
                ? 'bg-yellow-600 text-gray-700'
              : 'bg-yellow-500 text-gray-500'
            } hover:text-blue-900 text-sm sm:text-lg font-medium`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Main 3D Viewer Container - Responsive Width & Height */}
      <div className="w-full max-w-5xl mx-auto aspect-video relative rounded-lg overflow-hidden">

        {filteredProjects.length > 0 ? (
          <>
            {is3DProject() && (
              <motion.div
                key={filteredProjects[currentProjectIndex].id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                {/* Responsive 3D Viewer */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Canvas
                    camera={{ position: [0, 0, 10], fov: 50 }}
                    gl={{ antialias: true }}
                    dpr={[1, 2]}
                  >
                    <ambientLight intensity={0.5} />
                    <pointLight position={[15, 15, 15]} intensity={1} />
                    <pointLight position={[-5, -5, -5]} intensity={0.5} />
                    <ThreeErrorBoundary>
                      <WorldMap visible={filteredProjects[currentProjectIndex].type === 'worldMap'} />
                      <CrystalStructure visible={filteredProjects[currentProjectIndex].type === 'crystal'} scale={1.2} />
                      <ParticleSystem visible={filteredProjects[currentProjectIndex].type === 'particles'} scale={1.5}/>
                      <DNAHelix visible={filteredProjects[currentProjectIndex].type === 'dna'} />
                      <ParticleTorus visible={filteredProjects[currentProjectIndex].type === 'particleTorus'} scale={5} />
                    </ThreeErrorBoundary>
                    <OrbitControls
                      enableZoom={true}
                      autoRotate
                      autoRotateSpeed={0.5}
                      minPolarAngle={Math.PI / 6}
                      maxPolarAngle={Math.PI - Math.PI / 6}
                    />
                  </Canvas>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No projects found in this category</p>
          </div>
        )}

        {/* Navigation Buttons - Left & Right Centered */}
        {filteredProjects.length > 1 && (
          <>
            {/* Previous Button - Only show if not first */}
            {currentProjectIndex > 0 && (
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10 px-2 sm:px-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToPrev}
                  className="bg-yellow-800 hover:bg-yellow-700 text-white p-2 sm:p-4 rounded-full shadow-lg transition-opacity"
                  aria-label="Previous Project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              </div>
            )}

            {/* Next Button - Only show if not last */}
            {currentProjectIndex < filteredProjects.length - 1 && (
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10 px-2 sm:px-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToNext}
                  className="bg-yellow-800 hover:bg-yellow-700 text-white p-2 sm:p-4 rounded-full shadow-lg transition-opacity"
                  aria-label="Next Project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>

  );
};

export default PortfolioBar;