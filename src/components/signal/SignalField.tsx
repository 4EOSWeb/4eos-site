"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildSeeds, clusterCenter, latticeSize } from "./formations";
import { fragmentShader, vertexShader } from "./shader";
import { setMouse, signal } from "./store";
import { POINT_BUDGET, prefersReducedMotion, type DeviceTier } from "@/lib/env";

const BASE_COLOR = new THREE.Color("#4f86b4");
const ACCENT_COLOR = new THREE.Color("#f5b700");
const DETECT_COLOR = new THREE.Color("#e23b2c");
const _ndc = new THREE.Vector3();
const _dir = new THREE.Vector3();

function Points({
  count,
  still,
  lite,
}: {
  count: number;
  still: boolean;
  lite: boolean;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { invalidate } = useThree();

  const geometry = useMemo(() => {
    const seeds = buildSeeds(count);
    const position = new Float32Array(count * 3);
    const aUV = new Float32Array(count * 2);
    const aRand = new Float32Array(count);
    const aGold = new Float32Array(count);

    seeds.forEach((s, i) => {
      position[i * 3] = s.seed[0];
      position[i * 3 + 1] = s.seed[1];
      position[i * 3 + 2] = s.seed[2];
      aUV[i * 2] = s.u;
      aUV[i * 2 + 1] = s.v;
      aRand[i] = s.rand;
      aGold[i] = s.gold;
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(position, 3));
    g.setAttribute("aUV", new THREE.BufferAttribute(aUV, 2));
    g.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));
    g.setAttribute("aGold", new THREE.BufferAttribute(aGold, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(() => {
    const { cols, rows } = latticeSize(count);
    return {
      uTime: { value: 0 },
      uPhase: { value: signal.rendered },
      uIntensity: { value: signal.intensity },
      uResolve: { value: signal.resolve },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uGlowScale: { value: 1 },
      uFocus: { value: -1 },
      uFocusAge: { value: 0 },
      uZoom: { value: 0 },
      uZoomOn: { value: 0 },
      uScene: { value: 0 },
      uSceneMix: { value: 0 },
      uLite: { value: lite ? 1 : 0 },
      uCols: { value: cols },
      uRows: { value: rows },
      uBase: { value: BASE_COLOR },
      uAccent: { value: ACCENT_COLOR },
      uDetect: { value: DETECT_COLOR },
    };
  }, [lite, count]);

  useEffect(() => {
    signal.invalidate = invalidate;
    return () => {
      signal.invalidate = null;
    };
  }, [invalidate]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;

    // Ease toward the target so a fast scroll does not snap the field.
    const step = still ? 1 : 1 - Math.pow(0.0015, Math.min(delta, 0.05));
    signal.rendered += (signal.phase - signal.rendered) * step;
    if (Math.abs(signal.phase - signal.rendered) < 0.0005) {
      signal.rendered = signal.phase;
    }

    const mouseStep = still ? 1 : 1 - Math.pow(0.0008, Math.min(delta, 0.05));
    signal.mouseRX += (signal.mouseX - signal.mouseRX) * mouseStep;
    signal.mouseRY += (signal.mouseY - signal.mouseRY) * mouseStep;

    u.uPhase.value = signal.rendered;
    u.uIntensity.value = signal.intensity;
    u.uResolve.value = signal.resolve;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    const sceneTarget = signal.scene >= 0 ? 1 : 0;
    signal.sceneMix += (sceneTarget - signal.sceneMix) * step;
    if (Math.abs(sceneTarget - signal.sceneMix) < 0.0005) {
      signal.sceneMix = sceneTarget;
    }
    signal.focusAge = still ? 8 : Math.min(8, signal.focusAge + delta);

    u.uFocus.value = signal.focus;
    u.uFocusAge.value = signal.focusAge;
    u.uScene.value = signal.sceneShown;
    u.uSceneMix.value = signal.sceneMix;
    u.uZoom.value = signal.zoomR;
    u.uZoomOn.value = signal.zoom > 0.02 || signal.zoomR > 0.02 ? 1 : 0;

    // Cursor NDC → world XY on the field plane, through the camera that is
    // actually looking. The old frustum map (NDC * 14.5, 8.1) only held at z=20.
    _ndc.set(signal.mouseRX, signal.mouseRY, 0.5).unproject(state.camera);
    _dir.copy(_ndc).sub(state.camera.position);
    if (Math.abs(_dir.z) > 1e-5) {
      const t = -state.camera.position.z / _dir.z;
      (u.uMouse.value as THREE.Vector2).set(
        state.camera.position.x + _dir.x * t,
        state.camera.position.y + _dir.y * t,
      );
    }
    u.uGlowScale.value = state.camera.position.z / 20;

    if (!still) u.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CameraRig({ still, lite }: { still: boolean; lite: boolean }) {
  useFrame((state, delta) => {
    const zooming =
      signal.focus >= 0 &&
      signal.focus < 6 &&
      signal.zoom > 0.02 &&
      Math.abs(signal.phase - 4) < 0.6;
    if (zooming) {
      const [x, y] = clusterCenter(
        signal.focus,
        still ? 0 : state.clock.elapsedTime,
      );
      signal.lookX = x;
      signal.lookY = y;
    }
    // Travel in. The other clouds drop as soon as the zoom is asked for,
    // so the approach is one cloud getting closer rather than a jump.
    const dt = Math.min(delta, 0.05);
    const zoomStep = still ? 1 : 1 - Math.pow(0.18, dt);
    signal.zoomR += (signal.zoom - signal.zoomR) * zoomStep;
    if (Math.abs(signal.zoom - signal.zoomR) < 0.0005) signal.zoomR = signal.zoom;

    const z = signal.zoomR;
    const nearZ = lite ? 13.5 : 9;
    state.camera.position.set(
      signal.lookX * z * 0.55,
      signal.lookY * z * 0.55,
      20 + (nearZ - 20) * z,
    );
    state.camera.lookAt(signal.lookX * z, signal.lookY * z, 0);
  });
  return null;
}

export default function SignalField({ tier }: { tier: DeviceTier }) {
  const host = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);
  const [awake, setAwake] = useState(true);

  useEffect(() => {
    setStill(prefersReducedMotion());
  }, [tier]);

  useEffect(() => {
    if (still) return;
    const onMove = (event: PointerEvent) => {
      setMouse(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  // Stop the render loop entirely when the tab is hidden. A paused rAF is
  // the difference between a background tab costing nothing and costing a
  // GPU core.
  useEffect(() => {
    const onVisibility = () => setAwake(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const count = POINT_BUDGET[tier];
  if (count === 0) return null;

  const lite = tier === "reduced";
  const frameloop = !awake ? "never" : still ? "demand" : "always";

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    >
      <Canvas
        frameloop={frameloop}
        dpr={lite ? 1 : [1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ fov: 45, position: [0, 0, 20], near: 0.1, far: 100 }}
      >
        <CameraRig still={still} lite={lite} />
        <Points
          key={`${count}-${still ? "still" : "live"}-${lite ? "lite" : "full"}`}
          count={count}
          still={still}
          lite={lite}
        />
      </Canvas>
    </div>
  );
}
