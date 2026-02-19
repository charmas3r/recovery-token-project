/**
 * CoinModelCanvas — React Three Fiber WebGL coin scene.
 * Default export required for React.lazy().
 * Client-only: never imported server-side.
 */

import {useRef, useMemo, useEffect, useCallback, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {createFrontTexture, createBackTexture} from './coinTextures';

interface CoinModelCanvasProps {
  /** Canvas container size in CSS pixels */
  size?: number;
  /** Coin diameter in mm (renders at 96 DPI equivalent) */
  diameterMm?: number;
  /** Coin thickness in mm */
  thicknessMm?: number;
  accentColor?: string;
}

const AUTO_ROTATE_SPEED = 8; // degrees per second — slow, elegant tumble
const RESUME_DELAY = 2000; // ms before auto-rotate resumes after drag
const FOV = 30; // camera vertical field of view in degrees

/* ─── Inner Coin Mesh ────────────────────────────────────────── */

function CoinMesh({
  accentColor,
  normalizedThickness,
}: {
  accentColor: string;
  normalizedThickness: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isDragging = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);
  const dragStartX = useRef(0);
  const rotationAtDragStart = useRef(0);

  const {gl} = useThree();

  // Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      1,
      1,
      normalizedThickness,
      64,
      1,
    );
    return geo;
  }, [normalizedThickness]);

  // Create textures
  const {frontTexture, backTexture} = useMemo(() => {
    return {
      frontTexture: createFrontTexture(accentColor),
      backTexture: createBackTexture(accentColor),
    };
  }, [accentColor]);

  // Create materials array: [barrel, top cap (front), bottom cap (back)]
  const materials = useMemo(() => {
    const barrel = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      metalness: 0.85,
      roughness: 0.25,
    });
    const top = new THREE.MeshStandardMaterial({
      map: frontTexture,
      metalness: 0.7,
      roughness: 0.3,
    });
    const bottom = new THREE.MeshStandardMaterial({
      map: backTexture,
      metalness: 0.7,
      roughness: 0.3,
    });
    return [barrel, top, bottom];
  }, [accentColor, frontTexture, backTexture]);

  // Auto-rotate on all axes simultaneously for a slow tumble
  useFrame((_, delta) => {
    if (!meshRef.current || isDragging.current || paused) return;
    const rad = THREE.MathUtils.degToRad(AUTO_ROTATE_SPEED * delta);
    meshRef.current.rotation.x += rad;
    meshRef.current.rotation.y += rad;
    meshRef.current.rotation.z += rad * 0.3; // subtle Z wobble
  });

  // Pointer handlers
  const handlePointerDown = useCallback(
    (e: THREE.Event) => {
      // @ts-expect-error - R3F event type
      e.stopPropagation();
      isDragging.current = true;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      // @ts-expect-error - R3F pointer event
      dragStartX.current = e.clientX ?? e.nativeEvent?.clientX ?? 0;
      rotationAtDragStart.current = meshRef.current?.rotation.y ?? 0;
      gl.domElement.style.cursor = 'grabbing';
    },
    [gl],
  );

  const handlePointerMove = useCallback(
    (e: THREE.Event) => {
      if (!isDragging.current || !meshRef.current) return;
      // @ts-expect-error - R3F pointer event
      const clientX = e.clientX ?? e.nativeEvent?.clientX ?? 0;
      const deltaX = clientX - dragStartX.current;
      meshRef.current.rotation.y =
        rotationAtDragStart.current + deltaX * 0.01;
    },
    [],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setPaused(true);
    gl.domElement.style.cursor = 'grab';
    resumeTimer.current = setTimeout(() => setPaused(false), RESUME_DELAY);
  }, [gl]);

  // Also handle pointer leaving the canvas
  useEffect(() => {
    const canvas = gl.domElement;
    const handleLeave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setPaused(true);
        canvas.style.cursor = 'grab';
        resumeTimer.current = setTimeout(
          () => setPaused(false),
          RESUME_DELAY,
        );
      }
    };
    canvas.addEventListener('pointerleave', handleLeave);
    return () => {
      canvas.removeEventListener('pointerleave', handleLeave);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [gl]);

  // Cleanup
  useEffect(() => {
    return () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      frontTexture.dispose();
      backTexture.dispose();
    };
  }, [geometry, materials, frontTexture, backTexture]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={materials}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}

/* ─── Main Canvas Component ──────────────────────────────────── */

export default function CoinModelCanvas({
  size = 200,
  diameterMm = 40,
  thicknessMm = 3,
  accentColor = '#B8764F',
}: CoinModelCanvasProps) {
  // Exact thickness-to-diameter ratio: 3mm / 40mm = 0.075
  // Coin radius = 1 in world units (diameter = 2), so height = ratio * 2
  const normalizedThickness = (thicknessMm / diameterMm) * 2;

  // Position camera so the coin appears at exactly `diameterMm` mm on screen.
  // At 96 DPI: 1mm ≈ 3.7795px, so 40mm ≈ 151px.
  // We want coin diameter (2 world units) to fill coinPx/size of the canvas.
  const coinPx = diameterMm * (96 / 25.4); // mm → CSS pixels at 96 DPI
  const halfFovRad = THREE.MathUtils.degToRad(FOV / 2);
  // visible height = 2 * z * tan(fov/2); coin fills coinPx/size of that
  // 2 = (coinPx / size) * 2 * z * tan(fov/2)
  // z = size / (coinPx * tan(fov/2))
  const cameraZ = size / (coinPx * Math.tan(halfFovRad));

  return (
    <Canvas
      style={{
        width: `${size}px`,
        height: `${size}px`,
        cursor: 'grab',
      }}
      dpr={[1, 2]}
      camera={{position: [0, 0, cameraZ], fov: FOV}}
      shadows={false}
      flat
    >
      {/* 3-point lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[3, 4, 2]}
        intensity={1.5}
        color="#fff5e6"
      />
      <directionalLight
        position={[-3, 2, 1]}
        intensity={0.6}
        color="#e6f0ff"
      />
      <directionalLight
        position={[0, -1, -3]}
        intensity={0.4}
        color="#ffffff"
      />

      <CoinMesh
        accentColor={accentColor}
        normalizedThickness={normalizedThickness}
      />
    </Canvas>
  );
}
