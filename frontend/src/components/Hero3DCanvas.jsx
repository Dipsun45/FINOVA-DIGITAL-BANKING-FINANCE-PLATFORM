import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial, RoundedBox, Text } from '@react-three/drei';

function FloatingCard() {
  const cardRef = useRef();

  useFrame((state) => {
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.25;
      cardRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={cardRef}>
        {/* Main Card Body */}
        <RoundedBox args={[3.4, 2.1, 0.1]} radius={0.12} smoothness={4}>
          <meshStandardMaterial
            color="#0284c7"
            metalness={0.8}
            roughness={0.2}
            envMapIntensity={1}
          />
        </RoundedBox>

        {/* EMV Chip */}
        <mesh position={[-1.1, 0.3, 0.06]}>
          <planeGeometry args={[0.45, 0.35]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Contactless Waves Icon indicator */}
        <mesh position={[-1.1, -0.3, 0.06]}>
          <ringGeometry args={[0.1, 0.15, 16, 1, 0, Math.PI]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Card Title */}
        <Text
          position={[0.8, 0.6, 0.06]}
          fontSize={0.28}
          color="#ffffff"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf"
        >
          FINOVA
        </Text>

        {/* Card Number */}
        <Text
          position={[-0.1, -0.1, 0.06]}
          fontSize={0.22}
          color="#f8fafc"
          letterSpacing={0.08}
        >
          4821  9302  8410  4821
        </Text>

        {/* Card Holder & Expiry */}
        <Text
          position={[-0.9, -0.65, 0.06]}
          fontSize={0.13}
          color="#94a3b8"
        >
          CARD HOLDER
        </Text>
        <Text
          position={[-0.9, -0.8, 0.06]}
          fontSize={0.16}
          color="#ffffff"
        >
          DIPSUN PATEL
        </Text>

        <Text
          position={[0.8, -0.65, 0.06]}
          fontSize={0.13}
          color="#94a3b8"
        >
          EXPIRES
        </Text>
        <Text
          position={[0.8, -0.8, 0.06]}
          fontSize={0.16}
          color="#ffffff"
        >
          12/29
        </Text>
      </group>
    </Float>
  );
}

export default function Hero3DCanvas() {
  return (
    <div className="w-full h-[400px] md:h-[500px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} color="#38bdf8" />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#a855f7" />
        <pointLight position={[0, 0, 3]} intensity={2} color="#06b6d4" />
        <FloatingCard />
      </Canvas>
    </div>
  );
}
