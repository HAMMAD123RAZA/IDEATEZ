//client/src/components/portfolio/DNAHelix.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const DNAHelix = ({ visible }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.001;
    }
  });

  if (!visible) return null;

  const createNucleotide = (x, y, z, color) => (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
    </mesh>
  );

  const dnaPairs = [];
  const pairColors = ["#f24f36", "#2196f3"];
  const turns = 6;
  const points = 200;

  for (let i = 0; i < points; i++) {
    const t = i / points;
    const angle = t * Math.PI * 2 * turns;
    const x = Math.cos(angle) * 1;
    const y = (t - 0.5) * 6;
    const z = Math.sin(angle) * 1;

    dnaPairs.push(createNucleotide(x, y, z, pairColors[i % 2]));
    dnaPairs.push(createNucleotide(-x, y, -z, pairColors[(i + 1) % 2]));
  }

  return (
    <group ref={group}>
      {dnaPairs}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 6, 15, 4, true]} />
        <meshStandardMaterial color="#ffbb11" wireframe />
      </mesh>
    </group>
  );
};