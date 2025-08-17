//client/src/components/portfolio/BrandIdentityVisualizer.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const BrandIdentityVisualizer = ({ visible }) => {
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
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#FF9800" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  );
};