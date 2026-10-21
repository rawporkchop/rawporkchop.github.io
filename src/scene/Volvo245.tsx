import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import * as THREE from "three";

// Model conventions, established by the source file:
//   - Units are millimetres, so we scale by 1/1000 to reach 1 unit = 1 metre.
//   - The origin already sits at ground level, centred between the wheels.
//   - +X is forward (headlights at +X, tail lights at -X).
const MODEL_URL = "/volvo245.glb";

const MM_TO_M = 0.001;

export function Volvo245() {
  const { scene } = useGLTF(MODEL_URL);

  // GLTFLoader does not opt meshes into shadows, so we walk the loaded tree
  // once and set the flags ourselves. This mutates Three.js objects directly
  // rather than going through React state, same as useFrame does.
  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} scale={MM_TO_M} />;
}

useGLTF.preload(MODEL_URL);
