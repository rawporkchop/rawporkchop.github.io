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
    <mesh ref={ref} position={[0, 0.8, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#2F6B75" />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color={0x00ffff} />
    </mesh>
  );
}

export function Scene() {
  return (
    <Canvas shadows camera={{ position: [3, 2, 3], fov: 50 }}>
      <Lighting keyPosition={[5, 8, 5]} keyIntensity={2.5} />

      <Ground />
      <Box />
    </Canvas>
  );
}
