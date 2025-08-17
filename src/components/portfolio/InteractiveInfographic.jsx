//client/src/components/portfolio/InteractiveInfographic.jsx

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const InteractiveInfographic = ({ visible }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.001;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      <mesh>
        <coneGeometry args={[1, 2, 32]} />
        <meshStandardMaterial color="#009688" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  );
};