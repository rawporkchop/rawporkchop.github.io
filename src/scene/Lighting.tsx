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
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[5, 3, -5]} intensity={1} />
    </>
  );
}
