//client/src/components/portfolio/ProductConfigurator.jsx

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const ProductConfigurator = ({ visible }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.0015;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#9C27B0" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
};