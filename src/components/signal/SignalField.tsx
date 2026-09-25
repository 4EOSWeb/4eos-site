"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildSeeds, clusterCenter, latticeSize } from "./formations";
import { fragmentShader, vertexShader } from "./shader";
import { CONFIDENT_SETTLE, FLOW_DAMPING, FLOW_STIFFNESS, ORGANIC_FLOW } from "./flow";
import { setMouse, signal } from "./store";
import { MOBILE_FIT, POINT_BUDGET, prefersReducedMotion, type DeviceTier } from "@/lib/env";

const BASE_COLOR = new THREE.Color("#4f86b4");
const ACCENT_COLOR = new THREE.Color("#f5b700");
const DETECT_COLOR = new THREE.Color("#ff3b2e");
function Points({
  count,
  still,
  lite,
  mobile,
}: {
  count: number;
  still: boolean;
  lite: boolean;
  mobile: boolean;
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
      uPhaseVel: { value: 0 },
      uPhaseTarget: { value: signal.phase },
      uFlow: { value: ORGANIC_FLOW ? 1 : 0 },
      uSettle: { value: ORGANIC_FLOW && CONFIDENT_SETTLE ? 1 : 0 },
      uIntensity: { value: signal.intensity },
      uResolve: { value: signal.resolve },
      uPixelRatio: { value: 1 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1 },
      uFieldGlow: { value: 1 },
      uFocus: { value: -1 },
      uFocusAge: { value: 0 },
      uZoom: { value: 0 },
      uZoomOn: { value: 0 },
      uIconSpin: { value: 0 },
      uScene: { value: 0 },
      uSceneMix: { value: 0 },
      uLite: { value: lite ? 1 : 0 },
      uMobile: { value: mobile ? 1 : 0 },
      uCols: { value: cols },
      uRows: { value: rows },
      uBase: { value: BASE_COLOR },
      uAccent: { value: ACCENT_COLOR },
      uDetect: { value: DETECT_COLOR },
    };
  }, [lite, mobile, count]);

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
    // ORGANIC_FLOW swaps that exponential for a spring. Set the flag false
    // in ./flow.ts to put this block back to the single lerp.
    const dt = Math.min(delta, 0.05);
    const step = still ? 1 : 1 - Math.pow(0.0015, dt);
    if (still || !ORGANIC_FLOW) {
      signal.rendered += (signal.phase - signal.rendered) * step;
      signal.phaseVel = 0;
      if (Math.abs(signal.phase - signal.rendered) < 0.0005) {
        signal.rendered = signal.phase;
      }
    } else {
      signal.phaseVel += (signal.phase - signal.rendered) * FLOW_STIFFNESS * dt;
      signal.phaseVel *= Math.exp(-FLOW_DAMPING * dt);
      signal.rendered += signal.phaseVel * dt;
      if (
        Math.abs(signal.phase - signal.rendered) < 0.0004 &&
        Math.abs(signal.phaseVel) < 0.002
      ) {
        signal.rendered = signal.phase;
        signal.phaseVel = 0;
      }
    }

    signal.mouseRX = signal.mouseX;
    signal.mouseRY = signal.mouseY;

    u.uPhase.value = signal.rendered;
    u.uPhaseVel.value = signal.phaseVel;
    u.uPhaseTarget.value = signal.phase;
    u.uFlow.value = ORGANIC_FLOW && !still ? 1 : 0;
    u.uSettle.value = ORGANIC_FLOW && CONFIDENT_SETTLE && !still ? 1 : 0;
    u.uIntensity.value = signal.intensity;
    u.uResolve.value = signal.resolve;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    const sceneTarget = signal.scene >= 0 ? 1 : 0;
    signal.sceneMix += (sceneTarget - signal.sceneMix) * step;
    if (Math.abs(sceneTarget - signal.sceneMix) < 0.0005) {
      signal.sceneMix = sceneTarget;
    }
    signal.focusAge = still ? 8 : Math.min(8, signal.focusAge + delta);
    if (!still && signal.zoomR > 0) signal.iconSpin += 0.35 * signal.zoomR * delta;

    u.uFocus.value = signal.focus;
    u.uFocusAge.value = signal.focusAge;
    u.uScene.value = signal.sceneShown;
    u.uSceneMix.value = signal.sceneMix;
    u.uZoom.value = signal.zoomR;
    u.uZoomOn.value = signal.zoom > 0.02 ? 1 : 0;
    u.uIconSpin.value = signal.iconSpin;

    const pointer = u.uPointer.value as THREE.Vector2;
    const onUnmanaged = Math.max(0, 1 - Math.abs(signal.rendered));
    if (mobile && onUnmanaged > 0.02) {
      const t = state.clock.elapsedTime;
      pointer.set(Math.sin(t * 0.55) * 0.62, Math.sin(t * 0.37 + 1.4) * 0.42);
      u.uFieldGlow.value = onUnmanaged;
    } else if (mobile) {
      u.uFieldGlow.value = 0;
    } else {
      pointer.set(signal.mouseRX, signal.mouseRY);
      u.uFieldGlow.value = signal.fieldGlow;
    }
    u.uAspect.value = state.size.width / Math.max(state.size.height, 1);

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

function CameraRig({
  still,
  lite,
  mobile,
}: {
  still: boolean;
  lite: boolean;
  mobile: boolean;
}) {
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
    // Ease both ways, the same curve. The oval itself returns as soon as
    // the zoom is released; only the camera travels back.
    const dt = Math.min(delta, 0.05);
    const zoomStep = still ? 1 : 1 - Math.pow(0.18, dt);
    signal.zoomR += (signal.zoom - signal.zoomR) * zoomStep;
    if (Math.abs(signal.zoom - signal.zoomR) < 0.0005) signal.zoomR = signal.zoom;

    const z = signal.zoomR;
    const fit = mobile ? MOBILE_FIT : 1;
    const restZ = mobile ? 24 : 20;
    const nearZ = mobile ? 16 : lite ? 13.5 : 9;
    state.camera.position.set(
      signal.lookX * z * 0.55 * fit,
      signal.lookY * z * 0.55 * fit,
      restZ + (nearZ - restZ) * z,
    );
    state.camera.lookAt(signal.lookX * z * fit, signal.lookY * z * fit, 0);
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

  const mobile = tier === "mobile";

  useEffect(() => {
    if (still || mobile) return;
    const onMove = (event: PointerEvent) => {
      setMouse(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still, mobile]);

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
        dpr={mobile ? [1, 3] : lite ? 1 : [1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: mobile ? "low-power" : "high-performance",
        }}
        camera={{ fov: 45, position: [0, 0, 20], near: 0.1, far: 100 }}
      >
        <CameraRig still={still} lite={lite} mobile={mobile} />
        <Points
          key={`${count}-${still ? "still" : "live"}-${lite ? "lite" : "full"}-${mobile ? "mobile" : "desk"}`}
          count={count}
          still={still}
          lite={lite}
          mobile={mobile}
        />
      </Canvas>
    </div>
  );
}
