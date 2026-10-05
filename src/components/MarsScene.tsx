import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, OrbitControls, Stars, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type MissionView = "orbit" | "explorer" | "surface";

export type MarsLocation = {
  name: string;
  subtitle: string;
  detail: string;
  rover: string;
  priority: "HIGH" | "MEDIUM";
  position: [number, number, number];
};

export const LOCATIONS: MarsLocation[] = [
  { name: "OLYMPUS MONS", subtitle: "SHIELD VOLCANO", detail: "The largest volcano in the solar system, rising nearly 22 km above the datum.", rover: "Orbital survey", priority: "HIGH", position: [-1.55, 1.2, 2.58] },
  { name: "VALLES MARINERIS", subtitle: "CANYON SYSTEM", detail: "A continental-scale canyon preserving a record of Mars' geological evolution.", rover: "ARES-01", priority: "HIGH", position: [2.2, -0.45, 2.2] },
  { name: "JEZERO CRATER", subtitle: "MISSION TARGET", detail: "Ancient lakebed with evidence of past water activity and preserved delta deposits.", rover: "Perseverance", priority: "HIGH", position: [2.54, 1.04, 1.7] },
  { name: "GALE CRATER", subtitle: "SEDIMENTARY BASIN", detail: "Layered terrain reveals long-lived interactions between rock, water, and atmosphere.", rover: "Curiosity", priority: "HIGH", position: [1.88, -1.22, 2.2] },
  { name: "HELLAS PLANITIA", subtitle: "IMPACT BASIN", detail: "One of the deepest impact basins on Mars, with unusual atmospheric conditions.", rover: "Orbital survey", priority: "MEDIUM", position: [-0.2, -2.25, 2.4] },
  { name: "NORTH POLAR ICE CAP", subtitle: "WATER RESERVE", detail: "Layered deposits of water ice and seasonal carbon dioxide frost.", rover: "Polar scout", priority: "HIGH", position: [0.25, 2.95, 0.42] },
];

function createMarsTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  const image = context.createImageData(canvas.width, canvas.height);
  const data = image.data;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const i = (y * canvas.width + x) * 4;
      const lat = Math.abs(y / canvas.height - 0.5) * 2;
      const n = Math.sin(x * 0.041) * 17 + Math.sin((x + y) * 0.087) * 12 + Math.cos(y * 0.123) * 8 + Math.sin(x * 0.19 + y * 0.07) * 6;
      const crater = Math.sin(Math.hypot(x - 680, y - 245) * 0.22) * Math.exp(-Math.hypot(x - 680, y - 245) / 95) * 24;
      const ice = lat > 0.86 ? (lat - 0.86) * 410 : 0;
      data[i] = Math.min(224, 128 + n + crater + ice);
      data[i + 1] = Math.min(178, 55 + n * 0.45 + ice);
      data[i + 2] = Math.min(144, 30 + n * 0.22 + ice * 0.75);
      data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  context.globalAlpha = 0.18;
  for (let i = 0; i < 120; i += 1) {
    const x = (i * 487) % canvas.width;
    const y = (i * 211) % canvas.height;
    const radius = 4 + ((i * 17) % 22);
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.strokeStyle = i % 2 ? "#411d14" : "#e98b54";
    context.lineWidth = 2;
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function CameraDirector({ view, focus }: { view: MissionView; focus: MarsLocation | null }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const base = view === "surface" ? new THREE.Vector3(8, 5, 11) : view === "explorer" ? new THREE.Vector3(0, 0.4, 8.4) : new THREE.Vector3(1.4, 0.7, 10.5);
    if (focus && view === "explorer") base.set(focus.position[0] * 1.65, focus.position[1] * 1.65, focus.position[2] * 1.65 + 4.2);
    camera.position.lerp(base, 1 - Math.exp(-2.4 * delta));
    target.lerp(view === "surface" ? new THREE.Vector3(0, 0.7, 0) : new THREE.Vector3(0, 0, 0), 1 - Math.exp(-3 * delta));
    camera.lookAt(target);
  });
  return null;
}

function Orbiter() {
  const orbit = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/orbiter.glb");
  const model = useMemo(() => scene.clone(), [scene]);
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (orbit.current) orbit.current.rotation.y += delta * 0.28;
  });
  return (
    <group ref={orbit} rotation={[0.4, 0, -0.2]}>
      <group position={[5.1, 0, 0]} scale={0.42} rotation={[0.4, 1.1, 0.2]}>
        <primitive object={model} />
        <pointLight color="#f2a25f" intensity={5} distance={2} position={[-0.7, 0, 0]} />
      </group>
    </group>
  );
}

function MarsGlobe({ view, selected, onSelect }: { view: MissionView; selected: MarsLocation | null; onSelect: (location: MarsLocation) => void }) {
  const globe = useRef<THREE.Group>(null);
  const texture = useMemo(createMarsTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((_, rawDelta) => {
    if (globe.current && view === "orbit") globe.current.rotation.y += Math.min(rawDelta, 0.05) * 0.045;
  });
  return (
    <group ref={globe}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[3, 96, 64]} />
        <meshStandardMaterial map={texture} roughness={0.92} metalness={0.02} bumpMap={texture} bumpScale={0.12} />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[3, 64, 48]} />
        <meshBasicMaterial color="#e36e3b" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      {view === "explorer" && LOCATIONS.map((location) => (
        <group key={location.name} position={location.position}>
          <mesh onClick={(event) => { event.stopPropagation(); onSelect(location); }} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
            <sphereGeometry args={[selected?.name === location.name ? 0.11 : 0.075, 16, 16]} />
            <meshStandardMaterial color="#ffb36c" emissive="#ff7433" emissiveIntensity={selected?.name === location.name ? 4 : 2} />
          </mesh>
          <Html distanceFactor={8} position={[0.14, 0.1, 0]} center={false} style={{ pointerEvents: "none" }}>
            <span className="mars-marker-label">{location.name}</span>
          </Html>
        </group>
      ))}
      <Suspense fallback={null}><Orbiter /></Suspense>
    </group>
  );
}

function Rover({ scanning }: { scanning: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/ares-rover.glb");
  const model = useMemo(() => scene.clone(), [scene]);
  useEffect(() => {
    const keys = new Set<string>();
    const down = (event: KeyboardEvent) => keys.add(event.code);
    const up = (event: KeyboardEvent) => keys.delete(event.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const timer = window.setInterval(() => {
      const rover = group.current;
      if (!rover) return;
      if (keys.has("KeyA") || keys.has("ArrowLeft")) rover.rotation.y += 0.08;
      if (keys.has("KeyD") || keys.has("ArrowRight")) rover.rotation.y -= 0.08;
      const direction = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
      rover.translateZ(direction * 0.09);
      rover.position.x = THREE.MathUtils.clamp(rover.position.x, -12, 12);
      rover.position.z = THREE.MathUtils.clamp(rover.position.z, -12, 12);
    }, 16);
    return () => { window.clearInterval(timer); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  return (
    <group ref={group} position={[0, 0.52, 0]} scale={0.75}>
      <primitive object={model} />
      {scanning && <mesh rotation-x={Math.PI / 2} position-y={0.1}><torusGeometry args={[2.2, 0.035, 8, 64]} /><meshBasicMaterial color="#ff9e57" transparent opacity={0.8} /></mesh>}
    </group>
  );
}

function SurfaceScene({ scanning }: { scanning: boolean }) {
  const terrain = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(42, 42, 64, 64);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const edge = Math.hypot(x, y) / 28;
      position.setZ(i, Math.sin(x * 0.58) * 0.28 + Math.cos(y * 0.41) * 0.32 + Math.sin((x + y) * 0.91) * 0.11 - edge * 0.4);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  return (
    <group>
      <mesh geometry={terrain} rotation-x={-Math.PI / 2} receiveShadow><meshStandardMaterial color="#7e3823" roughness={1} flatShading /></mesh>
      <Suspense fallback={null}><Rover scanning={scanning} /></Suspense>
      <group position={[-6, 0.2, -4]}>
        <mesh castShadow position={[0, 0.8, 0]}><cylinderGeometry args={[1.7, 2, 1.6, 12]} /><meshStandardMaterial color="#d7cec0" metalness={0.5} roughness={0.4} /></mesh>
        <mesh castShadow position={[2.6, 0.65, 0]} rotation-z={-0.25}><boxGeometry args={[3.2, 0.12, 1.7]} /><meshStandardMaterial color="#23354a" metalness={0.85} roughness={0.25} /></mesh>
        <mesh position={[-2.1, 1.6, 0]}><cylinderGeometry args={[0.05, 0.05, 2.7, 8]} /><meshStandardMaterial color="#cbc3b8" /></mesh>
        <mesh position={[-2.1, 2.85, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.65, 0.06, 8, 28]} /><meshStandardMaterial color="#ddd4c8" metalness={0.7} /></mesh>
      </group>
    </group>
  );
}

export function MarsScene({ view, selected, scanning, onSelect }: { view: MissionView; selected: MarsLocation | null; scanning: boolean; onSelect: (location: MarsLocation) => void }) {
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: [1.4, 0.7, 10.5], fov: 48 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <color attach="background" args={[view === "surface" ? "#2a100b" : "#020305"]} />
      <fog attach="fog" args={[view === "surface" ? "#5a2618" : "#020305", view === "surface" ? 13 : 20, view === "surface" ? 38 : 48]} />
      <ambientLight intensity={view === "surface" ? 0.55 : 0.24} color="#b9c8de" />
      <directionalLight position={[8, 7, 9]} intensity={view === "surface" ? 2.4 : 3.1} color="#ffd4ab" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-8, -2, 5]} intensity={1.6} color="#c43f20" />
      <Environment>
        <Lightformer intensity={1.5} color="#e6f0ff" position={[5, 5, 7]} scale={[8, 8, 1]} />
        <Lightformer intensity={1} color="#9f3f24" position={[-5, -1, 3]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
      </Environment>
      <CameraDirector view={view} focus={selected} />
      {view === "surface" ? <SurfaceScene scanning={scanning} /> : <MarsGlobe view={view} selected={selected} onSelect={onSelect} />}
      {view !== "surface" && <Stars radius={60} depth={35} count={1800} factor={2.5} saturation={0.2} fade speed={0.25} />}
      {view === "explorer" && <OrbitControls enablePan={false} minDistance={5.4} maxDistance={12} autoRotate={!selected} autoRotateSpeed={0.22} />}
    </Canvas>
  );
}

useGLTF.preload("/models/ares-rover.glb");
useGLTF.preload("/models/orbiter.glb");