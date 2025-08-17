// client/src/components/Services.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ServicesSection = () => {
  const services = [
    { id: 1, icon: '📣', title: 'Digital Marketing', description: 'SEO, Social Media Marketing Strategies to grow your business.', cta: 'Learn More', path: 'Digital_Marketing' },
    { id: 2, icon: '💻', title: 'Web Development', description: 'Custom Websites, CMS Solutions and E-commerce platforms.', cta: 'Learn More', path: 'Web_&_App_Development' },
    { id: 3, icon: '🛒', title: 'App Development', description: 'iOS, Android, and Cross-Platform Apps for your business.', cta: 'Learn More', path: 'Web_&_App_Development' },
    { id: 4, icon: '🎨', title: 'UI/UX Design', description: 'Creative and user-friendly designs for seamless experiences.', cta: 'Learn More', path: 'Design_&_Development' },
    { id: 5, icon: '🔒', title: 'Cybersecurity', description: 'Protect your business with advanced security solutions.', cta: 'Learn More', path: 'Digital_Marketing_Outsourcing' },
    { id: 6, icon: '⚜️', title: 'Graphic Content Creation', description: 'Custom logos and brand kits that define your voice and captivate your audience.', cta: 'Learn More', path: 'Design_&_Development' },
    { id: 7, icon: '☁', title: 'Cloud Solutions', description: 'Scalable and secure cloud infrastructure for your business.', cta: 'Learn More', path: 'Digital_Marketing_Outsourcing' },
    { id: 8, icon: '֎🇦🇮', title: 'AI & Machine Learning', description: 'Intelligent solutions to automate and optimize processes.', cta: 'Learn More', path: 'Digital_Marketing_Outsourcing' },
  ];

  const REPEAT_COUNT = 100;
  const loopedServices = Array.from({ length: REPEAT_COUNT }, () => services).flat();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        moveNext();
      }, 3000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused, currentIndex]);

  const moveNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % loopedServices.length);
  };

  const movePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + loopedServices.length) % loopedServices.length);
  };

  const pauseSlider = () => {
    if (!isMobile) {
      setIsPaused(true);
      clearInterval(intervalRef.current);
    }
  };

  const resumeSlider = () => {
    if (!isMobile) {
      setIsPaused(false);
    }
  };

  const getCardSize = (index) => {
    if (isMobile) return 1;

    if (hoveredIndex !== null) return index === hoveredIndex ? 1 : 0.8;
    const centerOffset = 2;
    const distance = Math.abs(index - currentIndex - centerOffset);
    return 1 - Math.min(distance * 0.15, 0.6);
  };

  const handleMouseEnter = (index) => {
    pauseSlider();
    setHoveredIndex(index);
    clearTimeout(timeoutRef.current);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
      resumeSlider();
    }, 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-r relative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center text-gray-100 hover:text-gray-400">
          Our Expertise
        </h2>

        <div className="hidden lg:block relative overflow-hidden">
          <div
            className="flex transition-transform duration-1500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 20}%)`,
            }}
          >
            {loopedServices.map((service, index) => {
              const scale = getCardSize(index);
              return (
                <div
                  key={index}
                  className="w-1/5 flex-shrink-0 px-2"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  style={{ transform: `scale(${scale})`, transition: 'transform 0.5s ease' }}
                >
                  <div className="group bg-gray-900 bg-opacity-50 border-1 border-gray-700 p-1 rounded-lg shadow-lg hover:shadow-xl hover:border-amber-400 transition-all duration-900 flex flex-col">

                    <div className='h-40 bg-gray-700 flex items-center justify-center rounded-lg shadow-lg'>

                      <div className="text-6xl hover:text-8xl text-center mb-2 transition-all duration-400">
                        {service.icon}
                      </div>
                    </div>

                    <div className="p-1 flex-grow flex flex-col">
                      <h3 className="text-lg font-bold text-yellow-500 mb-2">
                        {service.title}
                      </h3>

                      <p className="text-sm text-gray-300 mb-3">
                        {service.description}
                      </p>

                      <div className="mt-auto text-center">

                        <Link
                          to={service.path}
                          className="inline-block bg-transparent border-1 border-yellow-500 px-8 text-yellow-500 rounded-md hover:bg-yellow-500 hover:bg-opacity-10 hover:text-gray-800 active:scale-97 transition duration-500"
                        >
                          {service.cta}
                        </Link>

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:hidden relative overflow-hidden">
          <div
            className="flex transition-transform duration-1500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (isMobile ? 100 : 33.33)}%)`,
            }}
          >
            {loopedServices.map((service, index) => (
              <div
                key={index}
                className={`flex-shrink-0 px-2 ${isMobile ? 'w-full' : 'w-1/3'}`}
              >
                <div className="bg-[#e8e4d7] border-4 border-yellow-500 p-3 rounded-lg shadow-lg h-full flex flex-col">
                  <div className="text-4xl text-center mb-1">
                    {service.icon}
                  </div>
                  <div className="flex-grow flex flex-col justify-end">
                    <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-3">
                      {service.description}
                    </p>
                    <div className="text-center">
                      <Link
                        to={service.path}
                        className="inline-block px-6 py-1 bg-gradient-to-r from-yellow-500 to-gray-800 text-white rounded-md text-sm"
                      >
                        {service.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <button onClick={movePrev} className="absolute left-0 top-1/2 transform -translate-y-1/2 text-4xl text-white ml-5">
            &#10094;
          </button>
          <button onClick={moveNext} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-4xl text-white mr-5">
            &#10095;
          </button>
        </div>



        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {services.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${index === currentIndex % services.length ? 'bg-white' : 'bg-gray-400'}`}
              onClick={() => setCurrentIndex(index)}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;