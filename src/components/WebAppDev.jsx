// client/src/components/WebAppDev.jsx

import React from 'react';
import serviceData from './ServicesPageData.json'; 
import ServiceSection from './ServicesSection';

import { serviceSliders } from './serviceSliders';

const WebAppDev = () => {
  const data = {
    ...serviceData.webAppDev,
    sliderData: serviceSliders.webAppDev.items, 
  };

  return <ServiceSection serviceData={data} />;
};

export default WebAppDev;