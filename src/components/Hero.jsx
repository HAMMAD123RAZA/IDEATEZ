// client/src/components/Hero.jsx

import React from 'react';
import { btnClas } from '../../constants/Colors';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r  py-20 px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="text-white max-w-2xl mb-8 md:mb-0">
          
          
          <h1 className="text-5xl md:text-6xl mt-15 font-bold mb-8 leading-tight">
            <span>Empowering Your</span> <br/>
            <span className="text-yellow-600">Digital Journey</span>
          </h1>

          <p className="text-xl mb-15">
            Expert Digital Marketing and Cutting-Edge Web & App Development Solutions.
          </p>
          <div className="flex space-x-4">
            <a href="/AboutUs">
              <button className="bg-transparent hover:border-yellow-600 hover:text-yellow-600 border-2 cursor-pointer hover:scale-103 active:scale-97 border-white text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                Learn More
              </button>
            </a>
            {/* <button className={`${btnClas}`}>
              Get a Quote
            </button> */}
          </div>
        </div>

        <div className="w-full md:w-1/2 lg:w-2/5">
          <img
            src="digi_agency.png"
            alt="Hero Illustration"
            className="w-full h-auto rounded-lg "
          />
        </div>
      </div>


    </section>
  );
};

export default HeroSection;