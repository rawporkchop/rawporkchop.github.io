interface LightingProps {
  keyPosition: [number, number, number];
  keyIntensity: number;
}

export function Lighting({ keyPosition, keyIntensity }: LightingProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={keyPosition}
        intensity={keyIntensity}
        castShadow
      />
      <directionalLight position={[5, 3, -5]} intensity={1} />
    </>
  );
}
