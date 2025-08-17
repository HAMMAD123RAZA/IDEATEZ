// client/src/components/PortfolioHero.jsx

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import PortfolioBar from './portfolioBar';
import { WavesDemo } from '../components/demo/waves-demo'

const PortfolioHero = () => {
  const [activeService, setActiveService] = useState(null);
  const [centerImage, setCenterImage] = useState('/da-log.png');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [pauseRotation, setPauseRotation] = useState(false);
  const [hoveredSubItem, setHoveredSubItem] = useState(null);
  const [hoveredService, setHoveredService] = useState(null);
  const logoRef = useRef(null);
  const rotationRef = useRef(null);
  const containerRef = useRef(null);
  const hoverTimeout = useRef(null); // Use ref to track timeout

  const serviceRefs = {
    development: useRef(null),
    marketing: useRef(null),
    outsourcing: useRef(null),
    designing: useRef(null)
  };

  const [originalPositions, setOriginalPositions] = useState({
    development: { x: 0, y: 0 },
    marketing: { x: 0, y: 0 },
    outsourcing: { x: 0, y: 0 },
    designing: { x: 0, y: 0 }
  });

  const connections = {
    development: {
      x: useMotionValue(0),
      y: useMotionValue(0),
      isDragging: false
    },
    marketing: {
      x: useMotionValue(0),
      y: useMotionValue(0),
      isDragging: false
    },
    outsourcing: {
      x: useMotionValue(0),
      y: useMotionValue(0),
      isDragging: false
    },
    designing: {
      x: useMotionValue(0),
      y: useMotionValue(0),
      isDragging: false
    }
  };

  const subMenuImages = {
    development: [
      { title: 'Dynamic Website', image: 'https://www.sliderrevolution.com/wp-content/uploads/2023/06/sneaker-woocommerce-slider.gif' },
      { title: 'e-Commerce Store', image: 'https://i.pinimg.com/originals/22/a9/52/22a952145b87318bfe3f151c5f8acb6f.gif' },
      { title: 'Landing Pages', image: 'https://i.ytimg.com/vi/9sqDdeWQgiE/maxresdefault.jpg' },
      { title: 'POS & ERP Solution', image: 'https://m.media-amazon.com/images/I/71hpKhg1rWL._AC_SL1500_.jpg' },
      { title: 'Cyber Security', image: 'https://www.bitlyft.com/hubfs/Cybersecurity-solutions.jpeg' },
      { title: 'Apps Development', image: 'https://www.addevice.io/storage/ckeditor/uploads/images/65f840d316353_mobile.app.development.1920.1080.png' },
      { title: 'Custom Softwares', image: 'https://media3.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif?cid=6c09b9527lnh5bxjc1qewwaben88ukavqa0uun6e2cacg2hl&ep=v1_gifs_search&rid=giphy.gif&ct=g' }
    ],
    marketing: [
      { title: 'Google Ads', image: 'https://omrdigital.com/wp-content/uploads/2024/12/google-ads-v1-editor-for-managing-ad-accounts.jpg' },
      { title: 'Meta Ads', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXyeQMkcH75vrj3ZKqM67V9nBycp5B0enxdg&s' },
      { title: 'SEO', image: 'https://i.pinimg.com/originals/1b/27/ed/1b27edfb1455bfd56d048bdddb6553af.gif' },
      { title: 'Social Media Management', image: 'https://media2.giphy.com/media/Yl2fpeyH384xlESfCS/200w.gif?cid=6c09b952orr07e7cavyrpl9ip0lu0iqhjfgr6x1am1tqrjvx&ep=v1_gifs_search&rid=200w.gif&ct=g' }
    ],
    outsourcing: [
      { title: 'Content Creation', image: 'https://liquidcreativestudio.com/wp-content/uploads/2023/03/content-creation.gif' },
      { title: 'Copywriting', image: 'https://careertraining.wwu.edu/common/images/2/23106/Persuasive-Copywriting935x572.jpg' },
      { title: 'Social Media Management', image: 'https://i.pinimg.com/originals/b7/dc/28/b7dc28bd0cb2998b255308383161c2ed.gif' },
      { title: 'Paid Ads', image: 'https://cdn.dribbble.com/userupload/2935496/file/original-71e213ac3adf9a952d06bb7a9fd9fa32.gif' },
      { title: 'SEO Services', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTssgB_96aSSTSCHFQsFZFEHYsDS_uxRMTQlg&s' }
    ],
    designing: [
      { title: 'Logos', image: 'https://play-lh.googleusercontent.com/gdgLICliYMY4AvC49an7yu_dhPSbtuX366sIm2OVHm9M_JGgP7ykFuHFxUTdhFBiCkM=w240-h480-rw' },
      { title: 'Ads', image: 'https://static.boredpanda.com/blog/wp-content/uploads/2014/01/creative-print-ads-57.jpg' },
      { title: 'Graphic Works', image: 'https://webnetpk.com/filemanager/photos/1/60af66bc68152.png' },
      { title: 'Reels', image: 'https://media0.giphy.com/media/3GSoFVODOkiPBFArlu/200w.gif?cid=6c09b952ikr9vtrtuvidu8m8moeuj7gha380k6an5a6kqu7x&ep=v1_gifs_search&rid=200w.gif&ct=g' },
      { title: 'Video Animations', image: 'https://techienet.co.uk/wp-content/uploads/2022/04/creating_video-1-min.gif' }
    ]
  };

  const services = [
    {
      id: 'development',
      title: 'Development',
      fullTitle: 'App Development',
      image: '/images/development.png',
      items: subMenuImages.development,
      position: 'left'
    },
    {
      id: 'marketing',
      title: 'Marketing',
      fullTitle: 'Digital Marketing',
      image: '/images/digital-marketing.png',
      items: subMenuImages.marketing,
      position: 'right'
    },
    {
      id: 'outsourcing',
      title: 'Outsourcing',
      fullTitle: 'Digital Marketing Outsourcing',
      image: 'https://png.pngtree.com/png-vector/20220905/ourmid/pngtree-transparent-we-are-digital-marketing-agency-text-for-social-media-post-png-image_6138688.png',
      items: subMenuImages.outsourcing,
      position: 'left'
    },
    {
      id: 'designing',
      title: 'Designing',
      fullTitle: 'Graphic Designing',
      image: '/images/graphic.png',
      items: subMenuImages.designing,
      position: 'right'
    }
  ];

  useEffect(() => {
    const saveOriginalPositions = () => {
      const positions = {};
      Object.keys(serviceRefs).forEach(serviceId => {
        if (serviceRefs[serviceId].current) {
          const rect = serviceRefs[serviceId].current.getBoundingClientRect();
          positions[serviceId] = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
          };
        }
      });
      setOriginalPositions(positions);
    };
    setTimeout(saveOriginalPositions, 500);
    window.addEventListener('resize', saveOriginalPositions);
    return () => window.removeEventListener('resize', saveOriginalPositions);
  }, []);

  useEffect(() => {
    let animationId;
    let pauseTimeoutId;

    if (activeService && !pauseRotation) {
      const animate = () => {
        setRotationAngle(prev => (prev - 0.2) % 360);
        animationId = requestAnimationFrame(animate);
      };

      animate();
    } else if (pauseRotation) {
      pauseTimeoutId = setTimeout(() => {
        if (!hoveredSubItem) {
          setPauseRotation(false);
        }
      }, 2000);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (pauseTimeoutId) {
        clearTimeout(pauseTimeoutId);
      }
    };
  }, [activeService, pauseRotation, hoveredSubItem]);

  const drawConnections = () => {
    if (!logoRef.current || !containerRef.current) return;
    const canvas = document.getElementById('connections-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const containerRect = containerRef.current.getBoundingClientRect();
    const logoRect = logoRef.current.getBoundingClientRect();

    const logoX = logoRect.left - containerRect.left + logoRect.width / 2;
    const logoY = logoRect.top - containerRect.top + logoRect.height / 2;

    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.keys(serviceRefs).forEach(serviceId => {
      const serviceRef = serviceRefs[serviceId];
      if (!serviceRef.current) return;

      const serviceRect = serviceRef.current.getBoundingClientRect();
      const serviceCenterX = serviceRect.left - containerRect.left + serviceRect.width / 2;
      const serviceCenterY = serviceRect.top - containerRect.top + serviceRect.height / 2;

      ctx.beginPath();
      ctx.moveTo(logoX, logoY);
      const cpX1 = logoX + (serviceCenterX - logoX) * 0.3;
      const cpY1 = logoY + (serviceCenterY - logoY) * 0.1;
      const cpX2 = logoX + (serviceCenterX - logoX) * 0.7;
      const cpY2 = logoY + (serviceCenterY - logoY) * 0.9;
      ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, serviceCenterX, serviceCenterY);


      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.7)';
      ctx.stroke();
    });
  };

  useEffect(() => {
    let animationId;

    const animate = () => {
      drawConnections();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const getDragConstraints = (serviceId) => {
    const serviceRef = serviceRefs[serviceId];
    if (!serviceRef.current) return { left: 0, right: 0, top: 0, bottom: 0 };

    const rect = serviceRef.current.getBoundingClientRect();
    const radius = 40;

    return {
      left: -(rect.width / 2) + radius,
      right: rect.width / 2 - radius,
      top: -(rect.height / 2) + radius,
      bottom: rect.height / 2 - radius,
    };
  };

  const handleServiceClick = (service) => {
    if (activeService === service.id) {
      setActiveService(null);
      setCenterImage('/da-log.png');
    } else {
      setActiveService(service.id);
      setCenterImage(service.image);
    }
  };

  const getSubmenuItemPosition = (index, total) => {
    const radius = 150;
    const baseAngle = (index / total) * (Math.PI * 2);
    const currentAngle = baseAngle + (rotationAngle * Math.PI / 180);
    return {
      x: Math.cos(currentAngle) * radius,
      y: Math.sin(currentAngle) * radius
    };
  };

  const isInBottomHalf = (position) => {
    return position.y > 0;
  };

  const getDynamicTitle = () => {
    if (activeService) {
      const service = services.find(s => s.id === activeService);
      return (
        <>
          <span className="text-yellow-500">{service.fullTitle}</span>
        </>
      );
    }
    return (
      <>
        <span className="text-white">SERVICES</span>
        <span className="text-yellow-500"> PORTFOLIO</span>
      </>
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      drawConnections();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center p-4 pb-20 relative overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      <canvas
        id="connections-canvas"
        className="absolute inset-0 pointer-events-none z-0 w-full h-full"
        style={{ clipPath: 'inset(0)' }}
      />

      <div
        className="text-center mb-12 z-10 px-4 max-w-3xl mx-auto 
           mt-24 md:mt-28 lg:mt-32 bg-gray-800 py-4 rounded-lg"
        style={{ marginTop: '10rem' }}
      >
        <motion.h2
          className="text-transparent bg-clip-text bg-gradient-to-r 
             from-cyan-400 via-purple-500 to-pink-500 
             text-xl md:text-2xl lg:text-3xl font-bold relative inline-block"
          key={activeService || 'default'}
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: 1,
            y: 0,
            backgroundPosition: ['0%', '100%', '0%']
          }}
          transition={{
            duration: 0.3,
            backgroundPosition: {
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
        >
          {getDynamicTitle()}

          <motion.span
            className="absolute inset-0 bg-gradient-to-r 
               from-transparent via-white/30 to-transparent 
               opacity-0 mix-blend-overlay bg-clip-text"
            initial={{ opacity: 0 }}
            whileHover={{
              opacity: 0.5,
              x: ['-120%', '120%'],
              transition: {
                duration: 1.5,
                ease: 'linear',
                repeat: Infinity
              }
            }}
          />
        </motion.h2>
      </div>

      <div className="relative w-full max-w-6xl z-10 scale-90 sm:scale-95 md:scale-100">
        <div
          ref={logoRef}
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-24 sm:w-36 h-24 sm:h-36"
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
                  animate-pulse-slow opacity-90 blur-md scale-110"></div>

            <div className="absolute inset-0 border-8 border-white/20 rounded-full bg-black/30 
                  backdrop-filter backdrop-blur-lg">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 
                    animate-rotate-slow opacity-30">
              </div>
            </div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              whileHover={{ scale: 1.10 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <motion.img
                key={centerImage}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                src={centerImage}
                alt="Center Logo"
                className="w-full h-full object-contain rounded-full relative z-10"
              />
            </motion.div>

            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-blue-500/30"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
                animate={{
                  scale: [2, 1.5, 2],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            ))}

            {activeService && (
              <div
                ref={rotationRef}
                className="absolute hidden sm:block"
                style={{
                  width: '300px',
                  height: '300px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                }}
              >
                {services.find(s => s.id === activeService)?.items.map((item, index, array) => {
                  const position = getSubmenuItemPosition(index, array.length);
                  const isHovered = hoveredSubItem === index;
                  const showTitleBelow = isInBottomHalf(position);

                  return (
                    <motion.div
                      key={index}
                      className="absolute z-30 cursor-pointer"
                      style={{
                        width: '70px',
                        height: '70px',
                        top: '50%',
                        left: '50%',
                        x: position.x - 35,
                        y: position.y - 35,
                      }}

                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      whileHover={{
                        scale: 1.15,
                        transition: { type: "spring", stiffness: 300, damping: 10 }
                      }}
                      onHoverStart={() => {
                        setHoveredSubItem(index);
                        setPauseRotation(true);
                      }}
                      onHoverEnd={() => {
                        setHoveredSubItem(null);
                      }}
                    >
                      <div className="relative h-full w-full flex flex-col items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500">
                            <img
                              src={item.image}
                              alt={item.title}
                              loading="lazy"
                              className="w-full h-full object-cover z-10"
                            />
                          </div>
                        </div>

                        {isHovered && (
                          <motion.div
                            className="absolute bottom-0 transform translate-y-full left-1/2 -translate-x-1/2"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-yellow-400 font-medium text-xs whitespace-nowrap">
                              {item.title}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 xl:gap-10">
          {services.map((service) => (
            <div key={service.id} className="flex flex-col items-center relative group">

              <motion.div
                ref={serviceRefs[service.id]}
                className="relative cursor-pointer mb-2 group z-20"
                whileHover={{
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300, damping: 15, duration: 0.4 }
                }}
                onClick={() => {
                  handleServiceClick(service);
                  setHoveredService(service.id);

                  setTimeout(() => {
                    setHoveredService(null);
                  }, 5000);
                }}


                onHoverStart={() => {
                  clearTimeout(hoverTimeout.current);
                  setHoveredService(service.id);
                }}

                onHoverEnd={() => {
                  hoverTimeout.current = setTimeout(() => {
                    setHoveredService(null);
                  }, 1000);
                }}
                drag
                dragConstraints={getDragConstraints(service.id)}
                dragElastic={0.9}
                dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}

                style={{
                  x: window.innerWidth < 640
                    ? connections[service.id].x * 1.5
                    : connections[service.id].x,
                  y: connections[service.id].y
                }}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-black rounded-full">
                    <div className="w-full h-full border-3 border-yellow-500 rounded-full overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {hoveredService === service.id && (
                  <motion.div
                    className={`absolute top-1/2 -translate-y-1/2 ${service.position === 'right' ? 'left-full ml-2 sm:ml-4' : 'right-full mr-2 sm:mr-4'
                      } z-10`}
                    initial={{
                      opacity: 1,
                      x: service.position === 'right' ? '-100%' : '100%',
                      scale: 0,
                      zIndex: -2,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: [0, 0.2, 1],
                      zIndex: -10,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0,
                      zIndex: -10,
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      times: [0, 0.33, 1],
                    }}
                  >
                    <div className="bg-yellow-800 px-2 sm:px-3 py-0.2 rounded-md shadow-md relative">
                      <motion.span
                        className="text-white font-medium text-xs sm:text-base whitespace-nowrap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {service.fullTitle}
                      </motion.span>
                      <motion.div
                        className="absolute inset-0 bg-blue-900 rounded-md mix-blend-multiply"
                        initial={{ scale: 1.2, opacity: 0.3 }}
                        animate={{ scale: 1, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className={`absolute inset-0 rounded-full bg-blue-500 opacity-0 ${activeService === service.id ? 'bg-opacity-20' : ''}`}
                  animate={{ opacity: activeService === service.id ? 0.2 : 0 }}
                />
              </motion.div>
            </div>
          ))}
        </div>

      </div>

      <div className="my-12 md:my-16 relative">
        {/* <div className="relative z-10">
          <WavesDemo />
        </div> */}
        <div className="relative z-20 mt-6 md:mt-10 p-6 rounded-xl shadow-2xl">
          <PortfolioBar />
        </div>
      </div>

    </div>
  );
};

export default PortfolioHero;