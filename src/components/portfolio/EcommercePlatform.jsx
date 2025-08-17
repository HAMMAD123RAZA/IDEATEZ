//client/src/components/portfolio/EcommercePlatform.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const EcommercePlatform = ({ visible }) => {
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
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color="#FFC107" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
};