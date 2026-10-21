import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Lighting } from "./Lighting.tsx";

function Box() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.5;
    ref.current.rotation.x += delta * 0.2;
  });

  return (
    <mesh ref={ref} position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#2F6B75" />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#4a4d4f" roughness={0.9} />
    </mesh>
  );
}

export function Scene() {
  return (
    <Canvas shadows camera={{ position: [6, 3, 7], fov: 45 }}>
      <color attach="background" args={["#1a1d1f"]} />

      <Lighting keyPosition={[5, 8, 5]} keyIntensity={2.5} />

      <Ground />
      <Box />

      <OrbitControls
        target={[0, 0.7, 0]}
        enablePan={false}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  );
}
