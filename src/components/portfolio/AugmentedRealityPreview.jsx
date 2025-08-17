//client/src/components/portfolio/AugmentedRealityPreview.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const AugmentedRealityPreview = ({ visible }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.002;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      <mesh>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  );
};