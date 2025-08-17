//client/src/components/portfolio/DataVisualizationTool.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const DataVisualizationTool = ({ visible }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.z += 0.001;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
        <meshStandardMaterial color="#CDDC39" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
};