// client/src/components/Digital_Marketing.jsx

import React from 'react';
import serviceData from './ServicesPageData.json'; 
import ServiceSection from './ServicesSection';
import { serviceSliders } from './serviceSliders';

const Digital_Marketing = () => {
  const data = {
    ...serviceData.digitalMarketing,
    sliderData: serviceSliders.digitalMarketing.items, 
  };

  return <ServiceSection serviceData={data} />;
};

export default Digital_Marketing;