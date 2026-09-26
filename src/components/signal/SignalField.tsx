"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CUBE_CX, CUBE_CY, CUBE_H, cubeGoal, quatDot, quatToMat, slerpQuat, type Quat } from "./cube";
import { buildSeeds, latticeSize } from "./formations";
import { fragmentShader, vertexShader } from "./shader";
import { CONFIDENT_SETTLE, FLOW_DAMPING, FLOW_STIFFNESS, ORGANIC_FLOW } from "./flow";
import { setMouse, signal } from "./store";
import { MOBILE_FIT, POINT_BUDGET, prefersReducedMotion, type DeviceTier } from "@/lib/env";

const cubeMatrix = new THREE.Matrix3();
const cubeQuat: Quat = [0, 0, 0, 1];
let cubeQuatLive = false;
let cubeLatch = -1;
let focusGone = 0;

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
      uCloud: { value: 0 },
      uLite: { value: lite ? 1 : 0 },
      uMobile: { value: mobile ? 1 : 0 },
      uCols: { value: cols },
      uRows: { value: rows },
      uCube: { value: cubeMatrix },
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

    // Phones always show the unmanaged cloud. Desktop keeps the chapter,
    // including the zoom into one industry.
    u.uPhase.value = mobile ? 0 : signal.rendered;
    u.uPhaseVel.value = mobile ? 0 : signal.phaseVel;
    u.uPhaseTarget.value = mobile ? 0 : signal.phase;
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
    const cloudStep = still ? 1 : 1 - Math.pow(0.04, dt);
    signal.cloudR += (signal.cloud - signal.cloudR) * cloudStep;
    if (Math.abs(signal.cloud - signal.cloudR) < 0.0005) signal.cloudR = signal.cloud;
    u.uCloud.value = mobile ? 0 : signal.cloudR;
    signal.focusAge = still ? 8 : Math.min(8, signal.focusAge + delta);
    if (!still && signal.zoomR > 0) signal.iconSpin += 0.35 * signal.zoomR * delta;

    u.uFocus.value = signal.focus;
    u.uFocusAge.value = signal.focusAge;
    u.uScene.value = signal.sceneShown;
    u.uSceneMix.value = mobile ? 0 : signal.sceneMix;
    u.uZoom.value = mobile ? 0 : signal.zoomR;
    u.uZoomOn.value = !mobile && signal.zoom > 0.02 ? 1 : 0;
    u.uIconSpin.value = signal.iconSpin;

    const pointer = u.uPointer.value as THREE.Vector2;
    if (mobile) {
      const t = state.clock.elapsedTime;
      pointer.set(Math.sin(t * 0.55) * 0.62, Math.sin(t * 0.37 + 1.4) * 0.42);
      u.uFieldGlow.value = 1;
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
  mobile,
}: {
  still: boolean;
  lite: boolean;
  mobile: boolean;
}) {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = still ? 0 : state.clock.elapsedTime;
    const onCube = !mobile && signal.rendered > 3.4 && signal.rendered < 4.6;
    const hovering = onCube && signal.focus >= 0 && signal.focus < 6;
    const pulling = signal.zoom > 0.02 || signal.zoomR > 0.03;
    if (hovering) {
      cubeLatch = signal.focus;
      focusGone = 0;
    } else if (!pulling) {
      focusGone += dt;
    } else {
      focusGone = 0;
    }
    // Keep the last face across the gap between names, and while the
    // camera is still on its way in or out.
    const holdFace = cubeLatch >= 0 && (hovering || pulling || focusGone < 0.2);
    const face = holdFace ? cubeLatch : -1;
    const goal = cubeGoal(t, face);
    if (!cubeQuatLive) {
      const spin = cubeGoal(t, -1);
      cubeQuat[0] = spin[0];
      cubeQuat[1] = spin[1];
      cubeQuat[2] = spin[2];
      cubeQuat[3] = spin[3];
      cubeQuatLive = true;
    }
    if (still) {
      cubeQuat[0] = goal[0];
      cubeQuat[1] = goal[1];
      cubeQuat[2] = goal[2];
      cubeQuat[3] = goal[3];
    } else if (face < 0 && quatDot(cubeQuat, goal) > 0.995) {
      cubeQuat[0] = goal[0];
      cubeQuat[1] = goal[1];
      cubeQuat[2] = goal[2];
      cubeQuat[3] = goal[3];
    } else {
      const rate = face < 0 ? 1.8 : 2.4;
      let frac = 1 - Math.exp(-rate * dt);
      if (face >= 0) {
        // Finish on the face in this frame once the leftover turn is
        // under a pixel. Copying the goal earlier was a visible snap.
        const ang = 2 * Math.acos(Math.min(1, quatDot(cubeQuat, goal)));
        if (ang * (1 - frac) < 0.004) frac = 1;
      }
      const next = slerpQuat(cubeQuat, goal, frac);
      cubeQuat[0] = next[0];
      cubeQuat[1] = next[1];
      cubeQuat[2] = next[2];
      cubeQuat[3] = next[3];
    }
    if (!holdFace) cubeLatch = face;
    const m = quatToMat(cubeQuat);
    cubeMatrix.set(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]);

    // The face is square before the camera moves. On the way out the
    // camera retreats first, and the tumble resumes after.
    const locked = still || (face >= 0 && quatDot(cubeQuat, goal) > 0.999);
    const zoomGoal = !mobile && signal.zoom > 0.5 && locked ? 1 : 0;
    const zoomStep = still ? 1 : 1 - Math.pow(0.42, dt);
    signal.zoomR += (zoomGoal - signal.zoomR) * zoomStep;
    if (Math.abs(zoomGoal - signal.zoomR) < 0.0005) signal.zoomR = zoomGoal;

    const z = mobile ? 0 : signal.zoomR;
    const fit = mobile ? MOBILE_FIT : 1;
    // Rest camera is the wide chapter. Zoom travels through the front face
    // (the face sits near z = 3.15) and comes out the far side.
    const restZ = mobile ? 24 : 20;
    const throughZ = -Math.max(0.85, CUBE_H * 0.35);
    state.camera.position.set(
      CUBE_CX * z * fit,
      CUBE_CY * z * fit,
      restZ + (throughZ - restZ) * z,
    );
    state.camera.lookAt(CUBE_CX * z * fit, CUBE_CY * z * fit, 0);
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
