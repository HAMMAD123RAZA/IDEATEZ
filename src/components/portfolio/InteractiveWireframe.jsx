//client/src/components/portfolio/InteractiveWireframe.jsx

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const InteractiveWireframe = ({ visible }) => {
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
        <boxGeometry args={[2, 2, 0.1]} />
        <meshStandardMaterial color="#3F51B5" wireframe />
      </mesh>
    </group>
  );
};