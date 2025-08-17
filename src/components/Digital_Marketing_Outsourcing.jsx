// client/src/components/Digital_Marketing_Outsourcing.jsx

import React from 'react';
import serviceData from './ServicesPageData.json'; 
import ServiceSection from './ServicesSection';
import { serviceSliders } from './serviceSliders';

const Digital_Marketing_Outsourcing = () => {
  const data = {
    ...serviceData.outsourcing,
    sliderData: serviceSliders.outsourcing.items, 
  };

  return <ServiceSection serviceData={data} />;
};

export default Digital_Marketing_Outsourcing;