//client/src/components/portfolio/WorldMap.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const WorldMap = ({ visible }) => {
  
  const group = useRef();

  useFrame((state) => {
    if (group.current) {
      group.current.scale.set(.80, .80, .80); // Scale up by 50%
      group.current.rotation.y += 0.001;
    }
  });

  if (!visible) return null;

  // Helper function to convert lat/lon to 3D position on globe
  const latLonToVector3 = (lat, lon, radius = 5.1) => {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);

    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Continent data with real-world approximate coordinates
  const continents = [
    { name: 'Europe', lat: 50, lon: 10 },
    { name: 'Asia', lat: 40, lon: 100 },
    { name: 'Africa', lat: 0, lon: 25 },
    { name: 'North America', lat: 40, lon: -100 },
    { name: 'South America', lat: -20, lon: -60 },
    { name: 'Australia', lat: -25, lon: 135 },
  ];

  return (
    <group ref={group}>
      {/* Globe Sphere */}
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          color="#1E88E5"
          metalness={0.2}
          roughness={0.8}
          emissive="#0D47A1"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Glowing Points at Continent Positions */}
      {continents.map((continent, i) => {
        const pos = latLonToVector3(continent.lat, continent.lon, 5.15);
        return (
          <mesh key={`point-${i}`} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial
              color="#FFEB3B"
              emissive="#FFEB3B"
              emissiveIntensity={2}
            />
          </mesh>
        );
      })}
    </group>
  );
};