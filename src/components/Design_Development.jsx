// client/src/components/Design_Development.jsx

import React from 'react';
import serviceData from './ServicesPageData.json'; 
import ServiceSection from './ServicesSection';
import { serviceSliders } from './serviceSliders';

const Design_Development = () => {
  const data = {
    ...serviceData.designDevelopment,
    sliderData: serviceSliders.designDevelopment.items, 
  };

  return <ServiceSection serviceData={data} />;
};

export default Design_Development;