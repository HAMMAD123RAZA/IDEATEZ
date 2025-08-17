//client/src/components/portfolio/DynamicLandingPage.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const DynamicLandingPage = ({ visible }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.x += 0.001;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      <mesh>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#FFEB3B" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  );
};