// components/PetModel/PetModel.tsx
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import {
  Bounds,
  Environment,
  OrbitControls,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

const MODEL_URL = "/models/capybara.glb";

export type CosmeticSlot = "HEADWEAR" | "BODYWEAR" | "FOOTWEAR";

export interface EquippedCosmetic {
  id: string; // stable key, e.g. the pet item id
  url: string; // .glb of the item
  slot: CosmeticSlot;
  socket: string; // name of this item's empty in the capybara file, e.g. "Deer Horn"
}

// How items are attached:
// "socket"  = as a child of their empty (the item's origin must be at the empty, with no extra rotation)
// "inPlace" = added to the capybara as exported (the item keeps the position it was modelled at)
const ATTACH_MODE: "socket" | "inPlace" = "inPlace";

// Camera distance: a bigger margin pulls the camera further back from the capybara
const FRAME_MARGIN = 1.4;

// Starting angle, around the vertical axis (radians). 0 = facing the camera.
// Positive turns the capybara to face the right of the screen; try -0.9 if it faces the wrong way.
const DEFAULT_YAW = 0.9;

// Start downloading as soon as this module is imported
useGLTF.preload(MODEL_URL);

/** Downloads and parses models into the shared cache ahead of time (no rendering). */
export function preloadModels(urls: string[]) {
  urls.forEach((url) => useGLTF.preload(url));
}

/**
 * Loose name matching, so small differences don't break the lookup:
 * ignores case, spaces, underscores, dots and Blender's ".001"-style suffixes.
 * "Deer Horn", "deer_horn" and "Deer Horn.001" all become "deerhorn".
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s._-]+/g, "")
    .replace(/\d{3}$/, "");
}

/**
 * Some exports put the texture in the EMISSION slot with a black base colour,
 * which renders almost black. Move the texture into the colour slot so it shows
 * exactly as painted. Materials that are already set up correctly are left alone.
 */
function fixEmissiveTextures(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    materials.forEach((material) => {
      const m = material as THREE.MeshStandardMaterial;
      if (m.map || !m.emissiveMap) return; // already fine

      m.map = m.emissiveMap;
      m.map.colorSpace = THREE.SRGBColorSpace;
      m.emissiveMap = null;
      m.emissive.set("#000000");
      m.color.set("#ffffff");
      m.metalness = 0;
      m.roughness = Math.max(m.roughness, 0.8);
      m.needsUpdate = true;
    });
  });
}

/** If one item fails to load, skip just that item instead of losing the whole pet. */
class CosmeticErrorBoundary extends Component<
  { url: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(
      `[PetModel] Couldn't load cosmetic ${this.props.url}. Is the file in public/ at that path?`,
      error,
    );
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** One wardrobe item, rendered as a child of its socket so it follows the capybara. */
function Cosmetic({ url, socket }: { url: string; socket: THREE.Object3D }) {
  const { scene } = useGLTF(url);

  // Own copy per mount, so the cached original is never moved or mutated
  const item = useMemo(() => {
    const copy = cloneSkinned(scene);
    fixEmissiveTextures(copy);
    return copy;
  }, [scene]);

  return createPortal(<primitive object={item} />, socket);
}

interface CapybaraProps {
  sleepy: boolean;
  cosmetics: EquippedCosmetic[];
  onReady?: () => void;
}

function Capybara({ sleepy, cosmetics, onReady }: CapybaraProps) {
  const tiltGroup = useRef<THREE.Group>(null);
  const animGroup = useRef<THREE.Group>(null);
  const { scene: cachedScene, animations } = useGLTF(MODEL_URL);

  // Own copy of the capybara per visit. Cosmetics are attached to THIS copy, so
  // nothing sticks to the cached original when the Sanctuary closes.
  const scene = useMemo(() => {
    const copy = cloneSkinned(cachedScene);
    fixEmissiveTextures(copy);
    return copy;
  }, [cachedScene]);

  const { actions, names } = useAnimations(animations, animGroup);

  // Index every named object in this copy by its loose name, once
  const nodesByName = useMemo(() => {
    const map = new Map<string, THREE.Object3D>();
    scene.traverse((obj) => {
      if (!obj.name) return;
      const key = normalizeName(obj.name);
      // Prefer empties (plain Object3D) over meshes if two share a name
      const existing = map.get(key);
      if (!existing || (existing as THREE.Mesh).isMesh) map.set(key, obj);
    });
    return map;
  }, [scene]);

  // Warn once per missing socket, listing the names the model actually has
  useEffect(() => {
    cosmetics.forEach((c) => {
      if (
        ATTACH_MODE === "socket" &&
        !nodesByName.has(normalizeName(c.socket))
      ) {
        console.warn(
          `[PetModel] Socket "${c.socket}" not found for ${c.url}. Names in the model:`,
          [...nodesByName.values()].map((o) => o.name),
        );
      }
    });
  }, [cosmetics, nodesByName]);

  // Tell the parent the model is on screen
  useEffect(() => {
    onReady?.();
  }, [scene, onReady]);

  // Play the first animation clip on a loop, if the file has any
  useEffect(() => {
    const idle = names.length > 0 ? actions[names[0]] : null;
    idle?.reset().fadeIn(0.3).play();
    return () => {
      idle?.fadeOut(0.3);
    };
  }, [actions, names]);

  // Napping: slow the animation down
  useEffect(() => {
    Object.values(actions).forEach((action) =>
      action?.setEffectiveTimeScale(sleepy ? 0.35 : 1),
    );
  }, [actions, sleepy]);

  // Napping: ease into a gentle tilt; awake: ease back upright
  useFrame((_, delta) => {
    if (!tiltGroup.current) return;
    const targetTilt = sleepy ? 0.18 : 0;
    tiltGroup.current.rotation.z = THREE.MathUtils.damp(
      tiltGroup.current.rotation.z,
      targetTilt,
      4,
      delta,
    );
  });

  return (
    <group ref={tiltGroup}>
      {/* Starting angle: the model is turned, the camera and drag controls stay as they are */}
      <group ref={animGroup} rotation={[0, DEFAULT_YAW, 0]}>
        <primitive object={scene} />
      </group>

      {cosmetics.map((c) => {
        const target =
          ATTACH_MODE === "inPlace"
            ? scene
            : nodesByName.get(normalizeName(c.socket));
        if (!target) return null;
        return (
          // Each item loads on its own: a slow item never hides the capybara,
          // and a broken one is skipped without taking the capybara down with it
          <CosmeticErrorBoundary key={c.id} url={c.url}>
            <Suspense fallback={null}>
              <Cosmetic url={c.url} socket={target} />
            </Suspense>
          </CosmeticErrorBoundary>
        );
      })}
    </group>
  );
}

interface PetModelProps {
  sleepy: boolean;
  cosmetics?: EquippedCosmetic[];
  onReady?: () => void;
}

export default function PetModel({
  sleepy,
  cosmetics = [],
  onReady,
}: PetModelProps) {
  return (
    <Canvas
      flat // no tone mapping: colours appear as painted in the texture
      dpr={[1, 2]}
      camera={{ position: [0, 0.6, 3], fov: 35 }}
      gl={{ alpha: true, antialias: true }}
      // pan-y: vertical swipes still scroll the page; horizontal drags rotate the pet
      style={{ background: "transparent", touchAction: "pan-y" }}
    >
      {/* Neutral, even lighting so the textures' own colours come through */}
      <Environment preset="studio" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 3]} intensity={1} />

      <Suspense fallback={null}>
        {/* Fits the camera to the capybara once; FRAME_MARGIN controls how far back it sits */}
        <Bounds fit clip margin={FRAME_MARGIN}>
          <Capybara sleepy={sleepy} cosmetics={cosmetics} onReady={onReady} />
        </Bounds>
      </Suspense>

      {/* Drag to spin the capybara. No zoom or pan, and no tilting up/down. */}
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.8}
        minPolarAngle={Math.PI / 2.4}
        maxPolarAngle={Math.PI / 2.4}
      />
    </Canvas>
  );
}
