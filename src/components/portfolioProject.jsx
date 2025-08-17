// client/src/components/portfolioProject.jsx

// import React from 'react';
// import { useRef, useEffect, useMemo, useState } from 'react';
// import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
// import { Canvas, useFrame, extend } from '@react-three/fiber';
// import { OrbitControls, useGLTF, Text, Float } from '@react-three/drei';
// import { EffectComposer, Glitch } from '@react-three/postprocessing';
// import { GlitchMode } from 'postprocessing';
// import * as THREE from 'three';
// import ThreeErrorBoundary from './ThreeErrorBoundary';

// // Extend Three.js with custom shaders or effects
// extend({ EffectComposer, Glitch });

// // 3D Model Component
// function LogoModel() {
//   const { scene } = useGLTF('/animated_logo.glb');
//   const model = useMemo(() => {
//     const clonedScene = scene.clone();
//     clonedScene.traverse((child) => {
//       if (child.isMesh) {
//         child.material = child.material.clone();
//       }
//     });
//     return clonedScene;
//   }, [scene]);
  
//   const meshRef = useRef();
  
//   useFrame(({ clock }) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
//     }
//   });

//   return <primitive object={model} ref={meshRef} dispose={null} />;
// }

// // Floating Sphere Component
// function FloatingSpheres({ count = 8 }) {
//   const groupRef = useRef();
//   const spheres = useMemo(() => Array(count).fill(), [count]);
  
//   useFrame(({ clock }) => {
//     if (groupRef.current) {
//       groupRef.current.children.forEach((sphere, i) => {
//         const time = clock.getElapsedTime();
//         sphere.position.x = Math.sin(time * 0.5 + i) * 5;
//         sphere.position.y = Math.cos(time * 0.3 + i) * 3;
//         sphere.position.z = Math.sin(time * 0.2 + i) * 2;
//       });
//     }
//   });

//   return (
//     <group ref={groupRef}>
//       {spheres.map((_, i) => (
//         <mesh 
//           key={i} 
//           position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5]}
//         >
//           <sphereGeometry args={[0.2 + Math.random() * 0.3, 16, 16]} />
//           <meshStandardMaterial 
//             color="#D4AF37" 
//             emissive="#D4AF37" 
//             emissiveIntensity={0.5} 
//           />
//         </mesh>
//       ))}
//     </group>
//   );
// }

// // Code Animation Component
// function CodeAnimation() {
//   const meshRef = useRef();
//   const [hovered, setHover] = useState(false);
  
//   useFrame((state) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x = THREE.MathUtils.lerp(
//         meshRef.current.rotation.x,
//         hovered ? Math.sin(state.clock.getElapsedTime()) / 2 : 0,
//         0.1
//       );
//       meshRef.current.rotation.y = THREE.MathUtils.lerp(
//         meshRef.current.rotation.y,
//         hovered ? Math.sin(state.clock.getElapsedTime()) / 2 : 0,
//         0.1
//       );
//     }
//   });

//   return (
//     <group ref={meshRef}>
//       <Float speed={2} rotationIntensity={1} floatIntensity={1}>
//         <Text
//           font="/fonts/ShareTechMono-Regular.ttf"
//           fontSize={0.5}
//           color="#D4AF37"
//           position={[0, 0, 0]}
//           onPointerOver={() => setHover(true)}
//           onPointerOut={() => setHover(false)}
//         >
//           {`function animate() {\n  requestAnimationFrame(animate);\n  cube.rotation.x += 0.01;\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n}\n\nanimate();`}
//           <meshStandardMaterial 
//             emissive="#D4AF37" 
//             emissiveIntensity={hovered ? 0.5 : 0.2}
//           />
//         </Text>
//       </Float>
//     </group>
//   );
// }

// // Particle System Component
// function Particles({ count = 200 }) {
//   const particlesRef = useRef();
//   const particles = useMemo(() => {
//     const positions = new Float32Array(count * 3);
//     const colors = new Float32Array(count * 3);
    
//     for (let i = 0; i < count; i++) {
//       positions[i * 3] = (Math.random() - 0.5) * 10;
//       positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
//       positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
//       colors[i * 3] = 0.9 + Math.random() * 0.1;
//       colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
//       colors[i * 3 + 2] = 0.1 + Math.random() * 0.1;
//     }
    
//     return { positions, colors };
//   }, [count]);
  
//   useFrame((state) => {
//     if (particlesRef.current) {
//       particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
//     }
//   });

//   return (
//     <points ref={particlesRef}>
//       <bufferGeometry attach="geometry">
//         <bufferAttribute
//           attach="attributes-position"
//           count={particles.positions.length / 3}
//           array={particles.positions}
//           itemSize={3}
//         />
//         <bufferAttribute
//           attach="attributes-color"
//           count={particles.colors.length / 3}
//           array={particles.colors}
//           itemSize={3}
//         />
//       </bufferGeometry>
//       <pointsMaterial
//         attach="material"
//         size={0.1}
//         sizeAttenuation
//         vertexColors
//         transparent
//         alphaTest={0.01}
//         opacity={0.8}
//       />
//     </points>
//   );
// }

// // Main Component
// export default function AnimationStudioHomepage() {
//   const containerRef = useRef(null);
//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ["start start", "end end"]
//   });
  
//   const [activeCanvas, setActiveCanvas] = useState('hero');
//   const [hoveredProject, setHoveredProject] = useState(null);
//   const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
//   const scaleProgress = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  
//   // Stats data
//   const stats = [
//     { value: 150, label: "Projects Completed", plus: "+" },
//     { value: 98, label: "Client Satisfaction", plus: "%" },
//     { value: 12, label: "Industry Awards", plus: "" },
//     { value: 8, label: "Years Experience", plus: "+" }
//   ];

//   // Projects data
//   const projects = [
//     {
//       id: 1,
//       title: "Cosmic Journey",
//       description: "Interactive space exploration experience with particle systems",
//       tags: ["Three.js", "WebGL", "Shaders"],
//       glbPath: "/space_exploration.glb"
//     },
//     {
//       id: 2,
//       title: "Neon Cityscape",
//       description: "Cyberpunk-inspired city with dynamic lighting effects",
//       tags: ["GLTF", "Post-processing", "Animation"],
//       glbPath: "/neon_city.glb"
//     },
//     {
//       id: 3,
//       title: "Molecular Visualization",
//       description: "Scientific visualization of complex molecular structures",
//       tags: ["Physics", "Data Viz", "WebXR"],
//       glbPath: "/molecules.glb"
//     }
//   ];

//   // Handle scroll to manage active canvas
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollPos = window.scrollY;
//       if (scrollPos < window.innerHeight) {
//         setActiveCanvas('hero');
//       } else if (scrollPos < window.innerHeight * 3) {
//         setActiveCanvas('projects');
//       } else if (scrollPos < window.innerHeight * 5) {
//         setActiveCanvas('code');
//       } else {
//         setActiveCanvas('none');
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <div 
//       ref={containerRef}
//       className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden"
//     >

//       <motion.section 
//         className="relative h-screen flex flex-col justify-center items-center"
//         style={{ opacity: backgroundOpacity }}
//       >
//         {activeCanvas === 'hero' && (
//           <div className="absolute inset-0 overflow-hidden">
//             <ThreeErrorBoundary fallback={<div className="text-white p-4">3D background unavailable</div>}>
//               <Canvas 
//                 camera={{ position: [0, 0, 5], fov: 45 }}
//                 onCreated={({ gl }) => {
//                   gl.domElement.addEventListener('webglcontextlost', (e) => {
//                     console.error('WebGL context lost', e);
//                     e.preventDefault();
//                   });
//                 }}
//               >
//                 <ambientLight intensity={0.5} />
//                 <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
//                 <FloatingSpheres count={12} />
//               </Canvas>
//             </ThreeErrorBoundary>
//           </div>
//         )}
        
//         {/* <motion.div 
//           className="relative z-10 text-center px-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 1 }}
//         >
//           <div className="h-64 w-64 mx-auto mb-8">
//             <ThreeErrorBoundary fallback={<div className="text-white p-4">3D logo unavailable</div>}>
//               <Canvas 
//                 camera={{ position: [0, 0, 3] }}
//                 frameloop="demand"
//               >
//                 <ambientLight intensity={0.5} />
//                 <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
//                 <LogoModel />
//                 <OrbitControls enableZoom={false} autoRotate />
//               </Canvas>
//             </ThreeErrorBoundary>
//           </div>
          
//           <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
//             Crafting Immersive 3D Experiences
//           </h1>
          
//           <motion.p 
//             className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-gray-300"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5, duration: 0.8 }}
//           >
//             We blend cutting-edge technology with artistic vision to create stunning 3D animations.
//           </motion.p>
          
//           <motion.button
//             className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             Explore Our Work
//           </motion.button>
//         </motion.div> */}

        
//       </motion.section>

//       <section className="py-28 px-4 relative">
//         <div className="max-w-7xl mx-auto">
//           <h2 className="text-4xl md:text-6xl font-bold mb-20 text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
//             Featured Projects
//           </h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
//             {projects.map((project, i) => (
//               <motion.div
//                 key={project.id}
//                 className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden border border-gray-700 hover:border-amber-400 transition-all duration-300 relative"
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.5, delay: i * 0.1 }}
//                 whileHover={{ y: -10 }}
//                 onHoverStart={() => setHoveredProject(project.id)}
//                 onHoverEnd={() => setHoveredProject(null)}
//               >
//                 <div className="h-64 bg-gray-700 flex items-center justify-center relative">
//                   {activeCanvas === 'projects' && (
//                     <ThreeErrorBoundary>
//                       <Canvas>
//                         <ambientLight intensity={0.5} />
//                         <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
//                         {hoveredProject === project.id ? (
//                           <EffectComposer>
//                             <Glitch
//                               delay={[1.5, 3.5]}
//                               duration={[0.6, 1.0]}
//                               strength={[0.3, 1.0]}
//                               mode={GlitchMode.SPORADIC}
//                               active
//                             />
//                           </EffectComposer>
//                         ) : null}
//                         <mesh>
//                           <boxGeometry args={[2, 2, 2]} />
//                           <meshStandardMaterial 
//                             color="#D4AF37" 
//                             emissive="#D4AF37" 
//                             emissiveIntensity={hoveredProject === project.id ? 0.8 : 0.3}
//                           />
//                         </mesh>
//                         <OrbitControls enableZoom={false} autoRotate={hoveredProject !== project.id} />
//                       </Canvas>
//                     </ThreeErrorBoundary>
//                   )}
//                 </div>
//                 <div className="p-6">
//                   <h3 className="text-2xl font-bold mb-2 text-amber-400">{project.title}</h3>
//                   <p className="text-gray-300 mb-4">{project.description}</p>
//                   <div className="flex flex-wrap gap-2">
//                     {project.tags.map(tag => (
//                       <span key={tag} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-amber-200">
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Code Animation Section */}
//       <section className="py-28 px-4 relative h-screen flex items-center">
//         <div className="absolute inset-0 overflow-hidden">
//           {activeCanvas === 'code' && (
//             <ThreeErrorBoundary>
//               <Canvas camera={{ position: [0, 0, 8] }}>
//                 <ambientLight intensity={0.5} />
//                 <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
//                 <Particles count={500} />
//               </Canvas>
//             </ThreeErrorBoundary>
//           )}
//         </div>
        
//         <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl md:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
//               Interactive Code Animations
//             </h2>
//             <p className="text-xl text-gray-300 mb-8">
//               We bring code to life with dynamic 3D visualizations that help explain complex concepts through engaging animations.
//             </p>
//             <motion.button
//               className="px-8 py-4 bg-transparent border-2 border-amber-400 rounded-full font-bold text-lg hover:bg-amber-400 hover:text-gray-900 transition-all duration-300"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Learn About Our Process
//             </motion.button>
//           </motion.div>
          
//           <motion.div 
//             className="h-96 w-full"
//             initial={{ opacity: 0, x: 50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             viewport={{ once: true }}
//           >
//             <ThreeErrorBoundary>
//               <Canvas camera={{ position: [0, 0, 10] }}>
//                 <ambientLight intensity={0.5} />
//                 <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
//                 <CodeAnimation />
//               </Canvas>
//             </ThreeErrorBoundary>
//           </motion.div>
//         </div>
//       </section>

//       {/* Process Section */}
//       <section className="py-28 px-4 relative bg-gradient-to-b from-black to-gray-900">
//         <div className="max-w-7xl mx-auto">
//           <h2 className="text-4xl md:text-6xl font-bold mb-20 text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
//             Our Creative Process
//           </h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
//             {[
//               {
//                 title: "Concept & Design",
//                 description: "We start with brainstorming sessions to develop the visual language and narrative structure.",
//                 icon: (
//                   <div className="h-32 w-32 mx-auto mb-6">
//                     <ThreeErrorBoundary>
//                       <Canvas camera={{ position: [0, 0, 3] }}>
//                         <ambientLight intensity={0.5} />
//                         <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
//                         <mesh>
//                           <torusGeometry args={[1, 0.4, 16, 32]} />
//                           <meshStandardMaterial 
//                             color="#D4AF37" 
//                             wireframe 
//                             emissive="#D4AF37" 
//                             emissiveIntensity={0.3}
//                           />
//                         </mesh>
//                       </Canvas>
//                     </ThreeErrorBoundary>
//                   </div>
//                 )
//               },
//               {
//                 title: "3D Modeling",
//                 description: "Our artists create detailed 3D models with proper topology for animation.",
//                 icon: (
//                   <div className="h-32 w-32 mx-auto mb-6">
//                     <ThreeErrorBoundary>
//                       <Canvas camera={{ position: [0, 0, 3] }}>
//                         <ambientLight intensity={0.5} />
//                         <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
//                         <mesh>
//                           <dodecahedronGeometry args={[1, 0]} />
//                           <meshStandardMaterial 
//                             color="#D4AF37" 
//                             emissive="#D4AF37" 
//                             emissiveIntensity={0.3}
//                           />
//                         </mesh>
//                       </Canvas>
//                     </ThreeErrorBoundary>
//                   </div>
//                 )
//               },
//               {
//                 title: "Animation & Rendering",
//                 description: "We bring models to life with realistic physics and cinematic rendering techniques.",
//                 icon: (
//                   <div className="h-32 w-32 mx-auto mb-6">
//                     <ThreeErrorBoundary>
//                       <Canvas camera={{ position: [0, 0, 3] }}>
//                         <ambientLight intensity={0.5} />
//                         <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
//                         <mesh>
//                           <icosahedronGeometry args={[1, 0]} />
//                           <meshStandardMaterial 
//                             color="#D4AF37" 
//                             wireframe 
//                             emissive="#D4AF37" 
//                             emissiveIntensity={0.5}
//                           />
//                         </mesh>
//                       </Canvas>
//                     </ThreeErrorBoundary>
//                   </div>
//                 )
//               }
//             ].map((step, i) => (
//               <motion.div
//                 key={step.title}
//                 className="bg-gray-800 bg-opacity-50 rounded-xl p-8 border border-gray-700 hover:border-amber-400 transition-all duration-300"
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.5, delay: i * 0.1 }}
//                 whileHover={{ y: -10 }}
//               >
//                 {step.icon}
//                 <h3 className="text-2xl font-bold mb-4 text-center text-amber-400">{step.title}</h3>
//                 <p className="text-gray-300 text-center">{step.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="py-28 px-4 bg-gradient-to-b from-gray-900 to-black">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {stats.map((stat, i) => (
//               <motion.div
//                 key={stat.label}
//                 className="text-center"
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.5, delay: i * 0.1 }}
//               >
//                 <p className="text-6xl font-bold mb-4 text-amber-400">
//                   {stat.value}{stat.plus}
//                 </p>
//                 <p className="text-xl text-gray-300">{stat.label}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

   
//     </div>
//   );
// }


// 2nd code 


import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export default function PortfolioHome() {
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const threeJsContainer = useRef(null);
  
  const projects = [
    { 
      title: "E-Commerce Platform", 
      description: "Full-stack online shopping platform with real-time inventory and payment processing",
      tags: ["React", "Node.js", "MongoDB", "Stripe"]
    },
    { 
      title: "AI Content Generator", 
      description: "Machine learning tool that creates custom marketing copy based on brand guidelines",
      tags: ["Python", "TensorFlow", "React", "AWS"]
    },
    { 
      title: "Virtual Reality Tour", 
      description: "Immersive VR experience for real estate property showcasing",
      tags: ["Three.js", "WebXR", "React", "WebGL"]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!threeJsContainer.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    threeJsContainer.current.appendChild(renderer.domElement);
    
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x5588ff,
    });
    
    const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleMesh);
    
    const torusGeometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff3366,
      wireframe: true
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);
    
    camera.position.z = 3;
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      particleMesh.rotation.x += 0.0005;
      particleMesh.rotation.y += 0.0005;
      
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.005;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    setTimeout(() => setLoaded(true), 500);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeJsContainer.current) {
        threeJsContainer.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5 + i * 0.2,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <div 
        ref={threeJsContainer} 
        className="absolute inset-0 z-0"
      />
      
      <div className="relative z-10">
        <section className="min-h-screen flex flex-col justify-center items-center px-4 md:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 1.2 }}
            className="text-center max-w-4xl mx-auto"
            style={{ 
              transform: `translateY(${scrollY * 0.2}px)`
            }}
          >
            <motion.h1 
              custom={0}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
            >
              Creative Developer
            </motion.h1>
            
            <motion.p 
              custom={1}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="text-lg md:text-xl text-gray-300 mb-8"
            >
              Building immersive digital experiences that blend design and technology
            </motion.p>
            
            <motion.div 
              custom={2}
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              <button className="bg-transparent hover:bg-pink-600 text-pink-500 hover:text-white font-semibold py-3 px-8 border-2 border-pink-500 hover:border-transparent rounded-full transition duration-300 mx-2 my-2">
                View Projects
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full transition duration-300 mx-2 my-2">
                Contact Me
              </button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: loaded ? 1 : 0, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12"
          >
            <div className="animate-bounce">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </section>
        
        <section className="py-24 px-4 md:px-8 bg-black bg-opacity-60">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-12 text-center"
            >
              Featured Projects
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={cardVariants}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700"
                >
                  <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                    <span className="text-4xl">✦</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-24 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-16"
            >
              Technical Expertise
            </motion.h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {['React', 'Three.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript', 'Node.js', 'WebGL', 'GSAP'].map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">{skill.charAt(0)}</span>
                  </div>
                  <p className="font-medium">{skill}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-24 px-4 md:px-8 bg-gradient-to-br from-purple-900 to-black">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Collaborate?</h2>
            <p className="text-xl text-gray-300 mb-8">Let's create something remarkable together</p>
            <button className="bg-white text-purple-900 hover:bg-gray-200 font-bold py-3 px-8 rounded-full text-lg transition duration-300">
              Get In Touch
            </button>
          </motion.div>
        </section>
        
        <footer className="py-8 px-4 md:px-8 text-center text-gray-500">
          <p>© 2025 Creative Developer. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}