// client/src/components/Navbar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const timeoutRef = useRef(null);
  const navbarRef = useRef(null);

  const handleMouseEnter = () => {
    if (!isMobileView()) {
      clearTimeout(timeoutRef.current);
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobileView()) {
      timeoutRef.current = setTimeout(() => {
        setHovered(false);
        setActiveMenu(null);
      }, 200);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [scrolled, isMobileMenuOpen]);

  const menuColors = {
    services: '#4F46E5',
    about: '#10B981',
    contact: '#F59E0B',
    portfolio: '#EC4899',
  };

  const menuItems = [
    {
      id: 'services',
      label: 'Services',
      path: '/services',
      submenu: [
        { 
          id: 'Web_&_App_Development', 
          icon: '👨🏼‍💻', 
          label: 'Web & App Development',
          path: '/Web_&_App_Development' 
        },
        { 
          id: 'Digital_Marketing', 
          icon: '📢', 
          label: 'Digital Marketing',
          path: '/Digital_Marketing' 
        },
        { 
          id: 'Digital_Marketing_Outsourcing', 
          icon: '🛍️', 
          label: 'Digital Marketing Outsourcing',
          path: '/Digital_Marketing_Outsourcing' 
        },
        { 
          id: 'Design_&_Development', 
          icon: '✨', 
          label: 'Design & Development',
          path: '/Design_&_Development' 
        },
      ],
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      path: '/portfolio',
    },
    {
      id: 'about',
      label: 'About Us',
      path: '/AboutUs',
    },
    {
      id: 'contact',
      label: 'Contact',
      path: '/Get_A_Quote',
      state: { formTitle: 'Contact Us' },
      submenu: [
        { 
          id: 'message', 
          icon: '📩', 
          label: 'Leave a Message',
          path: '/Get_A_Quote',
          state: { formTitle: 'Leave a Message' }
        },
        { 
          id: 'tech_support', 
          icon: '🔍', 
          label: 'Get Technical Support',
          path: '/Get_A_Quote',
          state: { formTitle: 'Technical Support' }
        },
        // { 
        //   id: 'careers', 
        //   icon: '👩🏻‍💻', 
        //   label: 'Careers',
        //   path: '/careers' 
        // },
      ],
    }
  ];

  const navbarVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    scrolled: {
      boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
    },
  };

  const menuButtonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const submenuVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      clipPath: 'inset(0% 0% 100% 0%)',
      transition: {
        duration: 0.2,
      },
    },
    visible: {  
      opacity: 1,
      y: 0,
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: {
        duration: 0.3,
        ease: 'easeOut',
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const submenuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.5,
      },
    },
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
      }
    },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05,
      }
    }
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const mobileSubmenuVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
      }
    },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
      }
    }
  };

  const getVisibleMenuItems = () => {
    if (scrolled && !hovered) {
      return [];
    } else {
      return menuItems;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      setActiveMenu(null);
    }
  };

  const isMobileView = () => {
    return windowWidth < 1024;
  };

  const toggleSubmenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleMobileMenuItemClick = (hasSubmenu) => {
    if (!hasSubmenu) {
      setIsMobileMenuOpen(false);
    }
  };

  const getNavbarInitialPosition = () => {
    if (isMobileView()) {
      return { top: 0, left: 0, width: '100%' };
    } else {
      return { left: '50%', x: '-50%', width: '550px' };
    }
  };

  const getNavbarAnimatePosition = () => {
    if (isMobileView()) {
      return { top: 0, left: 0, width: '100%' };
    } else {
      return {
        left: scrolled ? '20px' : '50%',
        x: scrolled ? '0' : '-50%',
        width: hovered ? '550px' : scrolled ? 'auto' : '550px',
      };
    }
  };

  return (
    <>
      <motion.div
        className="fixed top-0 w-full flex justify-center z-50 pt-4 pb-4"
        initial={getNavbarInitialPosition()}
        animate={getNavbarAnimatePosition()}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        ref={navbarRef}
      >
        <motion.div
          className={`flex items-center gap-2 bg-[#e8e4d7] text-gray-800 shadow-lg relative ${
            isMobileView() ? 'w-full rounded-lg px-3 py-1' : 'rounded-full px-4 py-2'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link to='/'>
            <motion.div
              className={`flex items-center ${isMobileView() ? 'mr-2' : 'mr-4'}`}
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover={!isMobileView() ? "hover" : undefined}
            >
              <img 
                src="/IdLogo1.jpg" 
                alt="Logo" 
                className={`${isMobileView() ? 'h-12' : 'h-16'} w-auto rounded-full`} 
              />
            </motion.div>
          </Link>

          <motion.button 
            className="lg:hidden ml-auto p-2 rounded-md focus:outline-none"
            onClick={toggleMobileMenu}
            variants={menuButtonVariants}
            whileTap="tap"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </motion.button>

          <div className="hidden lg:flex flex-1 items-center">
            {getVisibleMenuItems().map((item) => (
              <Link to={item.path} key={item.id} state={item.state || {}}>
                <motion.button
                  className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors duration-200 ${
                    activeMenu === item.id ? 'bg-gray-700 text-white' : ''
                  }`}
                  onMouseEnter={() => setActiveMenu(item.id)}
                  onMouseLeave={() => {
                    if (!item.submenu) {
                      setActiveMenu(null);
                    }
                  }}
                  variants={menuButtonVariants}
                  initial="initial"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: menuColors[item.id] + '44',
                    transition: { duration: 0.2 },
                  }}
                  whileTap="tap"
                  layout
                  style={{
                    backgroundColor: activeMenu === item.id ? menuColors[item.id] + '66' : '',
                  }}
                >
                  <motion.span
                    animate={{ rotate: activeMenu === item.id ? [0, -10, 10, -10, 0] : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span>{item.label}</span>
                </motion.button>
              </Link>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {isMobileMenuOpen && (
              <motion.div
                className="lg:hidden absolute top-full left-0 right-0 bg-[#e8e4d7] rounded-b-xl shadow-lg mt-1 overflow-hidden z-10"
                variants={mobileMenuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.div className="flex flex-col p-3 space-y-1">
                  {menuItems.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={mobileMenuItemVariants}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex flex-col">
                        <div 
                          className="flex items-center gap-3 px-3 py-3 rounded-md transition-colors duration-200 hover:bg-gray-200"
                        >
                          <Link
                            to={item.path}
                            state={item.state || {}}
                            className="flex items-center gap-3 flex-1"
                            onClick={() => handleMobileMenuItemClick(!!item.submenu)}
                          >
                            <span className="w-8 h-8 flex items-center justify-center bg-gray-700 text-white rounded-full">
                              {item.icon}
                            </span>
                            <span className="flex-1 font-medium">{item.label}</span>
                          </Link>
                          
                          {item.submenu && (
                            <motion.button
                              onClick={(e) => toggleSubmenu(e, item.id)}
                              className="p-2 rounded-full hover:bg-gray-300"
                              whileTap={{ scale: 0.95 }}
                            >
                              <motion.span
                                animate={{ rotate: activeMenu === item.id ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <svg 
                                  className="w-5 h-5" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M19 9l-7 7-7-7" 
                                  />
                                </svg>
                              </motion.span>
                            </motion.button>
                          )}
                        </div>
                        
                        <AnimatePresence>
                          {item.submenu && activeMenu === item.id && (
                            <motion.div
                              className="pl-10 pr-3 py-1 space-y-1 bg-   rounded-b-md"
                              variants={mobileSubmenuVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                            >
                              {item.submenu.map((subItem) => (
                                <motion.div
                                  key={subItem.id}
                                  variants={submenuItemVariants}
                                >
                                  <Link
                                    to={subItem.path}
                                    state={subItem.state || {}}
                                    className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 hover:bg-gray-200"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <span className="w-6 h-6 flex items-center justify-center bg-gray-600 text-white rounded-md">
                                      {subItem.icon}
                                    </span>
                                    <span>{subItem.label}</span>
                                  </Link>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {!isMobileView() && activeMenu && menuItems.find((item) => item.id === activeMenu)?.submenu && (
            <motion.div
              className="absolute top-[100%] -mt-2 p-4 bg-[#eae5d7] rounded-xl text-gray-900 shadow-lg z-10 overflow-hidden"
              style={{ marginBottom: '20px' }}
              onMouseEnter={() => {
                clearTimeout(timeoutRef.current);
                setHovered(true);
              }}
              onMouseLeave={() => {
                timeoutRef.current = setTimeout(() => {
                  setHovered(false);
                  setActiveMenu(null);
                }, 200);
              }}
              variants={submenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              key={activeMenu}
              // style={{
              //   width: '400px',
              //   borderTop: `3px solid ${menuColors[activeMenu]}`,
              // }}
            >
              <div className="flex flex-col gap-3">
                {menuItems
                  .find((item) => item.id === activeMenu)
                  .submenu.map((subItem, index) => (
                    <motion.div
                      key={subItem.id}
                      variants={submenuItemVariants}
                      custom={index}
                    >
                      <Link
                        to={subItem.path}
                        state={subItem.state || {}}
                        className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 text-left hover:bg-gray-300"
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="w-6 h-6 flex items-center justify-center bg-gray-700 text-white rounded-md">
                          {subItem.icon}
                        </span>
                        <span>{subItem.label}</span>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Navbar;