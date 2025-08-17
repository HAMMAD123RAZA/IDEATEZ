//client/src/components/portfolio/AiDashboard.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const AiDashboard = ({ visible }) => {
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
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#00BCD4" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};