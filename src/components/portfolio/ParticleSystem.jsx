//client/src/components/portfolio/ParticleSystem.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const ParticleSystem = ({ visible, scale = 1 }) => {
  const group = useRef();

  useFrame(() => {
    if (group.current && visible) {
      group.current.rotation.y += 0.001;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group} scale={[1.7,1.7,1.7]}>
      {/* Particle system */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={new Float32Array(
              [...Array(1000 * 3)].map(() => (Math.random() - 0.5) * 5)
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.005}
          color="#5588ff"
          transparent
          alphaTest={0.01}
        />
      </points>

      {/* Torus */}
      <mesh>
        <torusGeometry args={[1, 0.3, 16, 100]} />
        <meshBasicMaterial
          color="#ff3366"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};