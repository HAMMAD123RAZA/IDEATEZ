//client/src/components/portfolio/BlockchainExplorer.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const BlockchainExplorer = ({ visible, scale = 1 }) => {
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
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#FFFAB7" wireframe />
      </mesh>
    </group>
  );
};