//client/src/components/portfolio/ParticleTorus.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const ParticleTorus = ({ visible }) => {
  const group = useRef();
  const particles = useRef([]);

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.001;
    }
  });

  if (!visible) return null;

  // Generate random particles on mount
  if (!particles.current.length) {
    particles.current = [...Array(1000)].map(() => {
      const r = 1.5 + Math.random() * 0.5;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      const size = 0.01 + Math.random() * 0.02;
      const color = ['#f44336', '#2196f3', '#4caf50'][Math.floor(Math.random() * 3)];

      return { position: [x, y, z], size, color };
    });
  }

  return (
    <group ref={group}>
      {/* Floating Particles */}
      {particles.current.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={1}
          />
        </mesh>
      ))}

      {/* Torus Wireframe */}
      <mesh>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial color="#FF5722" wireframe />
      </mesh>
    </group>
  );
};