//client/src/components/portfolio/MotionDesignExploration.jsx

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const MotionDesignExploration = ({ visible }) => {
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
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial color="#FF5722" wireframe />
      </mesh>
    </group>
  );
};