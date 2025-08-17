//client/src/components/portfolio/NftGallery.jsx

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const NftGallery = ({ visible, scale = 1 }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.001;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group} scale={[1.7,1.7,1.7]}>
      <mesh>
        <torusGeometry args={[1.2, 0.2, 16, 100]} />
        <meshStandardMaterial color="F1F2F0" wireframe />
      </mesh>
    </group>
  );
};