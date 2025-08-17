//client/src/components/portfolio/RealTimeCollaborationTool.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const RealTimeCollaborationTool = ({ visible, scale = 1 }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.001;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group} scale={[2.5, 2.5, 2.5]}>
      <mesh>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#FFFF22" wireframe />
      </mesh>
    </group>
  );
};