/**
 * GLSL twin of the formation maths in ./formations.ts. Keep the two in step.
 *
 * `position` carries the per-point seed rather than a real position, because
 * every position is derived on the GPU. The mesh has frustum culling turned
 * off for the same reason.
 *
 * Formations are sized against the visible frustum: the camera sits at z=20
 * with a 45 degree field of view, so the viewport is 16.6 world units tall.
 * Anything meant to read as a whole shape stays inside roughly +/-7 in y.
 */

export const vertexShader = /* glsl */ `
#define TAU 6.28318530718

uniform float uTime;
uniform float uPhase;
uniform float uIntensity;
uniform float uResolve;
uniform float uPixelRatio;
uniform vec2 uMouse;
uniform float uGlowScale;
uniform float uFocus;
uniform float uFocusAge;
uniform float uZoom;
uniform float uLite;
uniform float uScene;
uniform float uSceneMix;

attribute vec2 aUV;
attribute float aRand;
// Accent membership is its own random. Deriving it from aRand would tie the
// accent to whatever aRand also selects — every gold point would land in the
// same industry cluster and the same coverage tier.
attribute float aGold;

varying float vAlpha;
varying float vGold;
varying float vDetect;

float hash21(float x, float y) {
  float n = fract(x * 12.9898 + y * 78.233);
  return fract(n * n * 45.233);
}

vec3 tube(vec3 a, vec3 b, float along, float ang, float rad) {
  vec3 dir = b - a;
  float t = clamp(along, 0.0, 1.0);
  vec3 p = a + dir * t;
  float dlen = length(dir);
  vec3 nDir = dlen > 1e-4 ? dir / dlen : vec3(0.0, 1.0, 0.0);
  vec3 up = abs(nDir.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 side = cross(nDir, up);
  float sl = length(side);
  side = sl > 1e-4 ? side / sl : vec3(1.0, 0.0, 0.0);
  vec3 bin = cross(nDir, side);
  return p + (side * cos(ang) + bin * sin(ang)) * rad;
}

vec3 yaw(vec3 p, float spin) {
  float c = cos(spin);
  float s = sin(spin);
  return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
}

vec3 bowl(float cx, float rimY, float along, float ang, float fill) {
  float phi = along * 1.5707963;
  float shell = 0.32 + fill * 0.12;
  float horiz = cos(phi) * shell;
  return vec3(cx + cos(ang) * horiz, rimY - sin(phi) * shell, sin(ang) * horiz);
}

// Local orb inside an industry mark. Twin of industryGlyph() in formations.ts.
// One assignment and a final return — early returns leave ANGLE with an
// uninitialised function result (X4000) and the mark disappears.
vec3 glyph(float k, vec3 seed, float extra) {
  float along = seed.x;
  float ang = seed.y * TAU;
  float fill = sqrt(hash21(seed.x, seed.y));
  vec3 p = vec3(0.0);

  if (k < 0.5) {
    p = bowl(extra < 0.81 ? -0.66 : 0.66, 0.0, along, ang, fill);
    if (extra < 0.1) p = tube(vec3(0.0, -1.08, 0.0), vec3(0.0, -0.9, 0.0), along, ang, 0.1 + fill * 0.22);
    else if (extra < 0.3) p = tube(vec3(0.0, -0.9, 0.0), vec3(0.0, 0.5, 0.0), along, ang, fill * 0.13);
    else if (extra < 0.48) p = tube(vec3(-0.92, 0.5, 0.0), vec3(0.92, 0.5, 0.0), along, ang, fill * 0.11);
    else if (extra < 0.55) p = tube(vec3(-0.66, 0.5, 0.0), vec3(-0.66, 0.02, 0.0), along, ang, fill * 0.05);
    else if (extra < 0.62) p = tube(vec3(0.66, 0.5, 0.0), vec3(0.66, 0.02, 0.0), along, ang, fill * 0.05);
  } else if (k < 1.5) {
    float phi = along * 1.5707963;
    float shell = 0.86 + fill * 0.14;
    float horiz = sin(phi) * shell;
    p = vec3(cos(ang) * horiz, cos(phi) * shell * 0.88 + 0.12, sin(ang) * horiz);
    if (extra >= 0.76) {
      float sweep = 3.14159265 * 1.2;
      float a = along * sweep;
      float crook = 0.36;
      float hx = (1.0 - cos(a)) * crook;
      float hy = -0.92 - sin(a) * crook;
      float thick = 0.045 + fill * 0.04;
      float c = cos(ang);
      float s = sin(ang);
      p = vec3(hx + cos(a) * c * thick, hy + sin(a) * c * thick, s * thick);
    } else if (extra >= 0.55) {
      p = tube(vec3(0.0, 0.55, 0.0), vec3(0.0, -0.92, 0.0), along, ang, fill * 0.09);
    }
  } else if (k < 2.5) {
    float rad = 0.16 + fill * 0.18;
    if (extra < 0.5) p = tube(vec3(-0.95, 0.0, 0.0), vec3(0.95, 0.0, 0.0), along, ang, rad);
    else if (along < 0.5) p = tube(vec3(0.0, -0.95, 0.0), vec3(0.0, -0.32, 0.0), along * 2.0, ang, rad);
    else p = tube(vec3(0.0, 0.32, 0.0), vec3(0.0, 0.95, 0.0), (along - 0.5) * 2.0, ang, rad);
  } else if (k < 3.5) {
    float rr = fill * 0.14;
    p = vec3(0.7 + cos(ang) * rr, -0.16 - abs(sin(ang)) * rr, (hash21(along, extra) - 0.5) * 0.16);
    if (extra < 0.32) p = tube(vec3(-0.52, -1.02, 0.0), vec3(-0.52, 0.92, 0.0), along, ang, 0.08 + fill * 0.14);
    else if (extra < 0.6) p = tube(vec3(-0.52, 0.84, 0.0), vec3(1.05, 0.64, 0.0), along, ang, 0.06 + fill * 0.12);
    else if (extra < 0.72) p = tube(vec3(-0.52, 0.84, 0.0), vec3(-1.02, 0.72, 0.0), along, ang, 0.06 + fill * 0.12);
    else if (extra < 0.9) p = tube(vec3(0.7, 0.7, 0.0), vec3(0.7, -0.05, 0.0), along, ang, fill * 0.05);
  } else if (k < 4.5) {
    float z = (hash21(seed.x, extra) - 0.5) * 0.62;
    if (extra < 0.52) {
      float a = along * TAU;
      float r = 0.4 + fill * 0.3;
      p = vec3(cos(a) * r, sin(a) * r, z);
    } else {
      float tooth = min(floor(along * 8.0), 7.0);
      float a = (tooth + 0.5) / 8.0 * TAU;
      float r = 0.68 + fract(along * 8.0) * 0.4;
      float w = (hash21(extra, seed.y) - 0.5) * 0.28;
      p = vec3(cos(a) * r - sin(a) * w, sin(a) * r + cos(a) * w, z);
    }
  } else {
    float bar = min(floor(extra * 3.0), 2.0);
    float h = 0.62 + bar * 0.48;
    float jx = (hash21(seed.x, extra) - 0.5) * 0.38;
    float jz = (hash21(seed.y, extra) - 0.5) * 0.55;
    p = vec3((bar - 1.0) * 0.78 + jx, -0.72 + along * h, jz);
  }

  return p;
}

// Rectangle outline in the XY plane. Twin of rectFrame() in formations.ts.
vec3 rectFrame(float along, float inset, float x0, float y0, float x1, float y1, float z, float thick) {
  float w = max(x1 - x0, 0.001);
  float h = max(y1 - y0, 0.001);
  float edge = min(floor(along * 4.0), 3.0);
  float t = fract(along * 4.0);
  float m = inset * thick;
  float spanW = w - 2.0 * m;
  float spanH = h - 2.0 * m;
  vec3 p = vec3(x0 + m + t * spanW, y0 + m, z);
  if (edge > 0.5 && edge < 1.5) p = vec3(x1 - m, y0 + m + t * spanH, z);
  else if (edge >= 1.5 && edge < 2.5) p = vec3(x1 - m - t * spanW, y1 - m, z);
  else if (edge >= 2.5) p = vec3(x0 + m, y1 - m - t * spanH, z);
  return p;
}

// One face of a box. plane 0 front (XY), 1 side (ZY), 2 top (XZ).
// Twin of faceFrame() in formations.ts.
vec3 faceFrame(float along, float inset, float u0, float u1, float v0, float v1, float held, float plane, float thick) {
  vec3 f = rectFrame(along, inset, u0, v0, u1, v1, held, thick);
  vec3 p = f;
  if (plane > 0.5 && plane < 1.5) p = vec3(f.z, f.y, f.x);
  else if (plane >= 1.5) p = vec3(f.x, f.z, f.y);
  return p;
}

// Straight stand neck. Twin of standNeck() in formations.ts.
vec3 standNeck(float x, float y0, float y1, float along, float across) {
  float t = clamp(along, 0.0, 1.0);
  return vec3(x + (across - 0.5) * 0.11, y0 + (y1 - y0) * t, 0.0);
}

// Desktop, server, or workstation in local space. Twin of deviceLocal().
// One return, so ANGLE keeps the result initialised.
vec3 deviceLocal(float kind, vec3 seed) {
  float part = fract(seed.x * 4.17);
  float u = seed.y;
  float v = seed.z;
  vec3 p = standNeck(-0.62, 0.12, -0.36, u, v);
  if (kind < 0.5) {
    p = faceFrame(u, v, -0.64, 0.64, -0.38, 0.38, -0.5, 2.0, 0.05);
    if (part < 0.22) p = faceFrame(u, v, -0.92, 0.92, 0.02, 1.32, 0.36, 0.0, 0.09);
    else if (part < 0.36) p = faceFrame(u, v, -0.68, 0.68, 0.22, 1.12, 0.4, 0.0, 0.045);
    else if (part < 0.5) p = faceFrame(u, v, -0.86, 0.86, 0.08, 1.26, -0.36, 0.0, 0.07);
    else if (part < 0.68) {
      float side = u < 0.5 ? -0.92 : 0.92;
      p = faceFrame(fract(u * 2.0), v, -0.36, 0.36, 0.02, 1.32, side, 1.0, 0.06);
    } else if (part < 0.8) p = faceFrame(u, v, -0.92, 0.92, -0.36, 0.36, 1.32, 2.0, 0.06);
    else if (part < 0.88) p = standNeck(0.0, 0.02, -0.42, u, v);
  } else if (kind < 1.5) {
    p = faceFrame(u, v, -0.44, 0.44, -1.16, 1.18, -0.68, 0.0, 0.06);
    if (part < 0.18) p = faceFrame(u, v, -0.5, 0.5, -1.22, 1.24, 0.68, 0.0, 0.07);
    else if (part < 0.4) {
      float bay = min(floor(u * 6.0), 5.0);
      p = vec3((v - 0.5) * 0.78, -0.92 + bay * 0.36, 0.72);
    } else if (part < 0.58) p = faceFrame(u, v, -0.68, 0.68, -1.22, 1.24, 0.5, 1.0, 0.06);
    else if (part < 0.74) p = faceFrame(u, v, -0.68, 0.68, -1.22, 1.24, -0.5, 1.0, 0.06);
    else if (part < 0.88) p = faceFrame(u, v, -0.5, 0.5, -0.68, 0.68, 1.24, 2.0, 0.055);
  } else {
    if (part < 0.16) p = faceFrame(u, v, -1.2, -0.12, 0.12, 1.22, 0.28, 0.0, 0.07);
    else if (part < 0.28) p = faceFrame(u, v, -0.28, 0.28, 0.12, 1.22, -1.2, 1.0, 0.05);
    else if (part < 0.36) p = faceFrame(u, v, -1.2, -0.12, -0.28, 0.28, 1.22, 2.0, 0.05);
    else if (part < 0.5) p = faceFrame(u, v, 0.18, 0.95, -0.7, 1.28, 0.48, 0.0, 0.06);
    else if (part < 0.66) {
      float bay = min(floor(u * 4.0), 3.0);
      p = vec3(0.28 + v * 0.55, -0.42 + bay * 0.4, 0.52);
    } else if (part < 0.82) p = faceFrame(u, v, -0.48, 0.48, -0.7, 1.28, 0.95, 1.0, 0.05);
    else if (part < 0.92) p = faceFrame(u, v, 0.18, 0.95, -0.48, 0.48, 1.28, 2.0, 0.05);
  }
  return p;
}

vec3 hardwareLocal(float which, vec3 seed) {
  float part = fract(seed.x * 4.17);
  float u = seed.y;
  float v = seed.z;
  float ang = u * TAU;
  vec3 p = tube(vec3(-0.85, -0.8, 0.0), vec3(0.85, -0.8, 0.0), u, ang, 0.07);
  if (which < 0.5) {
    p = tube(vec3(-1.45, -0.98, -0.14), vec3(1.45, -0.98, -0.14), u, ang, 0.06);
    if (part < 0.32) {
      vec3 deck = rectFrame(u, v, -1.55, -0.1, 1.55, 1.55, 0.0, 0.09);
      p = vec3(deck.x, -1.05, deck.y);
    } else if (part < 0.48) {
      float col = min(floor(u * 8.0), 7.0);
      float row = min(floor(v * 4.0), 3.0);
      p = vec3(-1.22 + col * 0.34, -0.96, 0.08 + row * 0.32);
    } else if (part < 0.92) {
      vec3 frame = rectFrame(u, v, -1.45, 0.02, 1.45, 2.35, 0.0, 0.1);
      float sy = frame.y;
      p = vec3(frame.x, -0.98 + sy * 1.08, -0.12 - sy * 0.28);
    }
  } else if (which < 1.5) {
    p = vec3((u - 0.5) * 1.24, 1.9, (v - 0.5) * 0.56);
    if (part < 0.28) p = rectFrame(u, v, -0.62, -1.85, 0.62, 1.9, 0.34, 0.08);
    else if (part < 0.46) {
      float corner = min(floor(u * 4.0), 3.0);
      float sx = corner < 2.0 ? -0.62 : 0.62;
      float sz = mod(corner, 2.0) < 0.5 ? -0.32 : 0.34;
      p = vec3(sx, -1.85 + v * 3.75, sz);
    } else if (part < 0.9) {
      float bay = min(floor(u * 7.0), 6.0);
      p = vec3((v - 0.5) * 0.96, -1.48 + bay * 0.46, 0.4);
    }
  } else {
    if (part < 0.6) p = rectFrame(u, v, -1.6, 0.05, 1.6, 2.15, 0.0, 0.1);
    else if (part < 0.78) p = tube(vec3(0.0, 0.05, 0.0), vec3(0.0, -0.72, 0.0), u, ang, 0.075);
  }
  return p;
}

vec3 ownershipDevice(float tier, float t) {
  vec3 seed = position;
  float f = fract(aRand * 13.7);
  float count = 3.0;
  float slot = min(floor(f * 3.0), 2.0);
  float kind = 0.0;
  if (tier >= 0.5 && tier < 1.5) {
    count = 5.0;
    slot = min(floor(f * 5.0), 4.0);
    kind = 1.0 - step(0.5, slot);
  } else if (tier >= 1.5) {
    count = 7.0;
    slot = min(floor(f * 7.0), 6.0);
    kind = slot < 2.5 ? 1.0 : 2.0;
  }
  float ring = 2.2 + tier * 1.75;
  float spin = t * (0.05 + tier * 0.02);
  float a = slot / count * TAU + tier * 0.55 + spin;
  float inset = 0.7 + fract(slot * 0.37 + tier * 0.2) * 0.08;
  float cx = cos(a) * ring * 1.8 * inset;
  float cy = sin(a) * ring * inset;
  vec3 local = deviceLocal(kind, seed);
  float scale = 0.48 + tier * 0.04;
  float yaw = a + 0.85;
  float pitch = 0.4;
  float x = local.x * scale;
  float y = local.y * scale;
  float z = local.z * scale;
  float cp = cos(pitch);
  float sp = sin(pitch);
  float y2 = y * cp - z * sp;
  float z2 = y * sp + z * cp;
  float c = cos(yaw);
  float s = sin(yaw);
  return vec3(cx + x * c + z2 * s, cy + y2, -x * s + z2 * c);
}

// Strategy-row pictures. Not chapter phases. Twin of serviceFormation().
vec3 serviceAt(int s, float t) {
  vec3 seed = position;
  vec3 p = vec3(0.0);
  if (s <= 0) {
    float a = aUV.x * TAU + t * 0.15;
    float r = 1.2 + pow(aRand, 0.6) * 2.4;
    p = vec3(cos(a) * r * 1.25, sin(a) * r, (seed.z - 0.5) * 1.1);
  } else if (s == 1) {
    float a = aUV.x * TAU + t * 0.04;
    float b = aUV.y * TAU;
    float R = 4.1;
    float tubeR = 0.62;
    float ring = R + tubeR * cos(b);
    p = vec3(ring * cos(a), ring * sin(a) * 0.72, tubeR * sin(b));
  } else if (s == 2) {
    float layer = min(floor(aRand * 3.0), 2.0);
    p = vec3(
      (aUV.x - 0.5) * 11.0,
      (aUV.y - 0.5) * 3.1 + (layer - 1.0) * 2.35,
      layer * 1.5
    );
  } else if (s == 3) {
    if (aRand < 0.22) {
      float part = fract(seed.x * 5.1);
      float ang = aUV.y * TAU;
      vec3 local = vec3((aUV.x - 0.5) * 2.6, -2.7 + (aUV.y - 0.5) * 0.28, (seed.z - 0.5) * 0.35);
      if (part < 0.26) {
        float rr = 0.42 + aUV.x * 0.32;
        local = vec3(cos(ang) * rr * 1.25, 1.95 + sin(ang) * rr * 0.78, (seed.z - 0.5) * 0.3);
      } else if (part < 0.52) {
        float rr = 0.36 + aUV.x * 0.28;
        local = vec3(cos(ang) * rr * 1.1, -1.95 + sin(ang) * rr * 0.72, (seed.z - 0.5) * 0.3);
      } else if (part < 0.78) {
        vec3 grip = tube(vec3(0.0, 1.42, 0.0), vec3(0.0, -1.42, 0.0), aUV.x, ang, 0.16);
        local = vec3(grip.x + sin(grip.y * 0.7) * 0.08, grip.y, grip.z);
      }
      local.y += 0.16 + sin(t * 1.1) * 0.14;
      float spin = sin(t * 0.7) * 0.2;
      float c = cos(spin);
      float sn = sin(spin);
      p = vec3(local.x * c + local.z * sn, local.y, -local.x * sn + local.z * c);
    } else if (aRand > 0.5) {
      p = vec3(0.0, -40.0, 0.0);
    } else {
      float travel = fract(t * 0.32 + seed.y * 0.65);
      if (travel > 0.9) p = vec3(0.0, -40.0, 0.0);
      else {
        float rad = 1.6 + travel * 6.4 + (aUV.y - 0.5) * 0.38;
        float a = aUV.x * TAU;
        p = vec3(cos(a) * rad, sin(a) * rad * 0.72, (seed.z - 0.5) * 0.22);
      }
    }
  } else if (s == 4) {
    float rack = min(floor(aRand * 5.0), 4.0);
    float x = (rack - 2.0) * 1.55;
    p = vec3(x + (seed.x - 0.5) * 0.42, (aUV.y - 0.5) * 6.6, (seed.z - 0.5) * 0.65);
  } else {
    float which = min(floor(aRand * 3.0), 2.0);
    float x = (which - 1.0) * 5.2;
    if (fract(aRand * 19.1) > 0.36) p = vec3(x, -40.0, 0.0);
    else {
      vec3 local = hardwareLocal(which, seed);
      float yaw = 0.62;
      if (which > 0.5 && which < 1.5) yaw = 0.42;
      else if (which > 1.5) yaw = -0.2;
      float c = cos(yaw);
      float sn = sin(yaw);
      p = vec3(x + local.x * c + local.z * sn, local.y, -local.x * sn + local.z * c);
    }
  }
  return p;
}

vec3 halo(vec3 seed) {
  float hz = (seed.z - 0.34) / 0.66;
  float az = seed.x * TAU;
  float cosP = hz * 2.0 - 1.0;
  float sinP = sqrt(max(0.0, 1.0 - cosP * cosP));
  // Biased inward so the cloud is dense in the middle and sparse at the rim.
  float R = 2.5 * pow(seed.y, 0.72);
  return vec3(cos(az) * sinP * R, cosP * R, sin(az) * sinP * R);
}

vec3 formation(int s, float t) {
  vec3 seed = position;

  if (s <= 0) {
    // Unmanaged: an unstructured cloud with slow, aimless drift.
    return vec3(
      (seed.x - 0.5) * 30.0 + sin(t * 0.18 + seed.y * TAU) * 0.9,
      (seed.y - 0.5) * 17.0 + cos(t * 0.15 + seed.z * TAU) * 0.7,
      (seed.z - 0.5) * 12.0
    );
  }
  if (s == 1) {
    // Discovery: the cloud resolves onto a regular lattice.
    return vec3(
      (aUV.x - 0.5) * 26.0,
      (aUV.y - 0.5) * 13.6,
      sin(aUV.x * 7.0 + t * 0.35) * 0.55
    );
  }
  if (s == 2) {
    // Ownership: three concentric tiers — Base, Pro, Premium.
    float tier = floor(aRand * 3.0);
    float r = 2.2 + tier * 1.75 + (seed.z - 0.5) * 0.3;
    float a = aUV.x * TAU + tier * 0.6 + t * (0.05 + tier * 0.02);
    return vec3(cos(a) * r * 1.8, sin(a) * r, (seed.x - 0.5) * 0.8);
  }
  if (s == 3) {
    // Security: a perimeter closes around the interior.
    float onRing = step(0.3, aRand);
    float a = aUV.x * TAU + t * 0.06;
    // sqrt spreads the interior evenly across the disc; a linear radius
    // piles everything into the centre.
    // Interior fills almost to the ring so the lighthouse shaft is a
    // continuous beam, not a disc and a rim with a dark moat between them.
    float r = mix(sqrt(seed.x) * 5.9, 6.4 + (seed.y - 0.5) * 0.28, onRing);
    return vec3(cos(a) * r * 1.8, sin(a) * r, (seed.z - 0.5) * 0.7);
  }
  if (s == 4) {
    // Industries: a small mark inside a sphere of orbs. Yaw only while
    // zoomed into this cluster.
    float k = min(floor(aRand * 6.0), 5.0);
    float match = uFocus < 0.0 ? 0.0 : (1.0 - step(0.5, abs(k - uFocus)));
    // Skip the mark maths for clusters the zoom has already dropped.
    if (uZoom > 0.45 && uFocus >= 0.0 && match < 0.5) {
      return vec3(0.0, -40.0, 0.0);
    }
    float a = k / 6.0 * TAU - 1.5707963;
    float extra = fract(aRand * 6.0);
    vec3 local = seed.z < 0.34 ? glyph(k, seed, extra) * 0.22 : halo(seed);
    local = yaw(local, t * 0.35 * uZoom * match);
    return vec3(cos(a) * 3.4 + 4.2 + local.x, sin(a) * 3.4 + 0.2 + local.y, local.z);
  }
  if (s == 5) {
    // Response: a calm disc, a tight inbox, and a few issues that leave
    // the rim and extinguish before they arrive.
    vec3 p = vec3(0.0);
    if (aRand < 0.07) {
      float a = seed.x * TAU;
      float rad = sqrt(seed.y) * 0.55;
      p = vec3(cos(a) * rad * 1.15, sin(a) * rad, (seed.z - 0.5) * 0.22);
    } else if (aRand > 0.93) {
      float travel = fract(t * 0.35 + seed.y);
      float a = aUV.x * TAU;
      float rad = 7.2 - travel * 6.39;
      p = vec3(cos(a) * rad * 1.55, sin(a) * rad, (seed.z - 0.5) * 0.3);
      if (travel > 0.72) p = vec3(0.0, -40.0, 0.0);
    } else {
      float a = aUV.x * TAU + t * 0.015;
      float rad = sqrt(seed.x) * 6.5;
      p = vec3(cos(a) * rad * 1.55, sin(a) * rad, (seed.z - 0.5) * 0.45);
    }
    return p;
  }
  // Strategy: the field leans forward onto a receding horizon.
  float depth = aUV.y;
  return vec3(
    (aUV.x - 0.5) * 34.0 * (0.3 + depth * 0.95),
    -4.2 + depth * 6.4,
    -depth * 13.0
  );
}

/**
 * How much screen area each formation spreads the same point count over.
 * A ring packs sixty thousand points into a thin line and a cloud spreads
 * them over a volume; without per-formation weighting the tight ones
 * saturate to white while the loose ones disappear.
 */
float density(int s) {
  if (s <= 0) return 0.55;
  if (s == 1) return 0.85;
  if (s == 2) return 0.30;
  if (s == 3) return 0.32;
  if (s == 4) return 0.40;
  if (s == 5) return 0.48;
  return 0.60;
}

float serviceDensity(int s) {
  if (s <= 0) return 0.50;
  if (s == 1) return 0.28;
  if (s == 2) return 0.62;
  if (s == 3) return 0.58;
  if (s == 4) return 0.34;
  return 0.52;
}

void main() {
  float ph = clamp(uPhase, 0.0, 6.0);
  int a = int(floor(ph));
  int b = int(min(floor(ph) + 1.0, 6.0));
  float m = smoothstep(0.0, 1.0, fract(ph));

  vec3 pos = mix(formation(a, uTime), formation(b, uTime), m);

  // A slice of the lit ownership ring becomes devices. They start above
  // the ring and ease down. The other two rings stay plain circles.
  float device = 0.0;
  float nearOwn = 1.0 - clamp(abs(ph - 2.0), 0.0, 1.0);
  if (nearOwn > 0.0 && uFocus >= 0.0 && fract(aRand * 19.1) <= 0.2) {
    float tier = floor(aRand * 3.0);
    float match = 1.0 - step(0.5, abs(tier - uFocus));
    if (match > 0.5) {
      vec3 dev = ownershipDevice(tier, uTime);
      dev.y += exp(-uFocusAge * 2.6) * 5.0;
      pos = mix(pos, dev, nearOwn);
      device = nearOwn;
    }
  }

  // A strategy row shows its own picture without moving the chapter phase.
  // uScene stays on the last row so the fade-out still has a shape.
  if (uSceneMix > 0.001) {
    pos = mix(pos, serviceAt(int(clamp(uScene, 0.0, 5.0)), uTime), uSceneMix);
  }
  float sceneOff = 1.0 - uSceneMix;

  // Flashlight: nearby points brighten. They do not move.
  // uMouse is world XY on the z=0 plane, unprojected through the live camera.
  // uGlowScale = camera.z / 20 so the shaft keeps its screen size when closer.
  float toMouse = length(pos.xy - uMouse);
  float glow = smoothstep(5.8 * uGlowScale, 0.0, toMouse);

  float dens = mix(density(a), density(b), m);
  dens = mix(dens, serviceDensity(int(clamp(uScene, 0.0, 5.0))), uSceneMix);
  vAlpha = 0.62 * dens * uIntensity;
  float voiced = step(2.5, uScene) * (1.0 - step(3.5, uScene));
  float gear = step(4.5, uScene);
  vAlpha *= mix(1.0, 1.35, (voiced + gear) * uSceneMix);
  vAlpha *= mix(1.0, 2.2, glow);
  vDetect = 0.0;

  // Hover focus: pull the matching industry cluster or ownership tier
  // forward and dim the rest. uFocus < 0 means nothing is selected.
  if (uFocus >= 0.0) {
    float nearOwnership = (1.0 - clamp(abs(ph - 2.0), 0.0, 1.0)) * sceneOff;
    float nearIndustries = (1.0 - clamp(abs(ph - 4.0), 0.0, 1.0)) * sceneOff;
    if (nearOwnership > 0.0) {
      float tier = floor(aRand * 3.0);
      float match = 1.0 - step(0.5, abs(tier - uFocus));
      vAlpha *= mix(0.38, 1.75, match);
      pos.z += match * 0.9 * nearOwnership * (1.0 - device);
    }
    if (nearIndustries > 0.0) {
      float k = floor(aRand * 6.0);
      float match = 1.0 - step(0.5, abs(k - uFocus));
      float dim = mix(0.32, 0.08, uZoom);
      float lift = mix(1.85, 2.1, uZoom);
      vAlpha *= mix(dim, lift, match);
      pos.z += match * 1.5 * nearIndustries;
    }
  }

  // A small minority of points carry the accent. Glow warms the hot
  // centre of the flashlight without turning the field orange.
  vGold = step(0.955, aGold) * 0.7;
  vGold = max(vGold, glow * glow * 0.45);

  // Discovery: emphasise every few rows and columns so the lattice reads as
  // structure rather than as a finer grade of noise.
  float nearDiscovery = 1.0 - clamp(abs(ph - 1.0), 0.0, 1.0);
  if (nearDiscovery > 0.0) {
    float gx = abs(fract(aUV.x * 42.0) - 0.5);
    float gy = abs(fract(aUV.y * 24.0) - 0.5);
    float onLine = smoothstep(0.40, 0.5, max(gx, gy));
    vAlpha *= mix(1.0, mix(0.45, 1.9, onLine), nearDiscovery);
  }

  // Security: a lighthouse beam rotates from the centre and is absorbed
  // when it hits the perimeter. The shaft is a narrow wedge; the ring
  // glow is the same sweep landing on the edge, not a substitute for it.
  float nearSecurity = (1.0 - clamp(abs(ph - 3.0), 0.0, 1.0)) * sceneOff;
  float beam = 0.0;
  if (nearSecurity > 0.0) {
    float ang = atan(pos.y, pos.x);
    float heading = uTime * 0.55;
    float da = atan(sin(ang - heading), cos(ang - heading));
    float ellipseR = length(pos.xy / vec2(1.8, 1.0));
    // ~11 degree half-width, soft edges so it reads as a shaft not a pie.
    float shaft = smoothstep(0.20, 0.03, abs(da));
    float along = smoothstep(0.08, 0.7, ellipseR) * (1.0 - smoothstep(7.0, 7.8, ellipseR));
    beam = shaft * along * nearSecurity;
    vGold = max(vGold, beam);
    vAlpha *= mix(1.0, 2.4, beam);

    float atPerimeter = smoothstep(5.4, 6.3, ellipseR) * (1.0 - smoothstep(6.9, 7.5, ellipseR));
    vGold = max(vGold, shaft * atPerimeter * nearSecurity);

    // Marked endpoints light red when the shaft hits them, then stay red
    // for about half a second. The beam moves at 0.55 rad/s, so 0.28 rad
    // behind the shaft is that half-second. aGold is seeded once, so the
    // same dots detect on every pass.
    float marked = step(0.91, aGold);
    float linger = smoothstep(-0.30, -0.04, da) * (1.0 - smoothstep(0.0, 0.02, da));
    vDetect = marked * nearSecurity * max(shaft, linger);
    vAlpha *= mix(1.0, 2.6, vDetect);
  }

  // Response: a soft pulse leaves the centre and dies before the rim.
  // The inbox is the tight cluster; stray issues have already gone out.
  float nearResponse = (1.0 - clamp(abs(ph - 5.0), 0.0, 1.0)) * sceneOff;
  if (nearResponse > 0.0) {
    float rad = length(pos.xy / vec2(1.55, 1.0));
    float front = mod(uTime * 1.4, 8.0);
    float band = smoothstep(0.85, 0.0, abs(rad - front));
    float die = 1.0 - smoothstep(4.2, 5.4, front);
    vGold = max(vGold, band * die * nearResponse);
    if (aRand < 0.07) vGold = max(vGold, 0.65 * nearResponse);
  }

  // Strategy: dissolve into the horizon and pick out lanes along the
  // direction of travel, so the plane reads as distance rather than a slab.
  // A service picture takes the field over, so the horizon treatment steps aside.
  float nearStrategy = smoothstep(5.0, 6.0, ph) * sceneOff;
  if (nearStrategy > 0.0) {
    float fade = 1.0 - smoothstep(0.45, 1.0, aUV.y);
    float lane = smoothstep(0.38, 0.5, abs(fract(aUV.x * 26.0) - 0.5));
    vAlpha *= mix(1.0, fade * mix(0.5, 1.6, lane), nearStrategy);
  }

  // Industry cloud glows from its own centre: hot in the middle, a faint
  // dusting at the rim. The mark is a small bright object inside that glow.
  float nearIndustries = (1.0 - clamp(abs(ph - 4.0), 0.0, 1.0)) * sceneOff;
  float onGlyph = (1.0 - step(0.34, position.z)) * nearIndustries;
  float onHalo = step(0.34, position.z) * nearIndustries;
  float core = 0.0;
  if (nearIndustries > 0.0) {
    float kk = min(floor(aRand * 6.0), 5.0);
    float ca = kk / 6.0 * 6.2831853 - 1.5707963;
    vec2 ctr = vec2(cos(ca) * 3.4 + 4.2, sin(ca) * 3.4 + 0.2);
    float rad = length(vec3(pos.x - ctr.x, pos.y - ctr.y, pos.z));
    core = pow(clamp(1.0 - rad / 2.5, 0.0, 1.0), 1.35);
  }
  vAlpha *= mix(1.0, 1.35, onGlyph);
  vAlpha *= mix(1.0, mix(0.16, 1.85, core), onHalo);
  vAlpha *= mix(1.0, 1.7, device * sceneOff);

  // Once a zoom is underway, stop rasterising the other five clusters.
  // That is the expensive part of flying in on a slower GPU.
  float hide = 0.0;
  if (nearIndustries > 0.0 && uFocus >= 0.0) {
    float k = floor(aRand * 6.0);
    float match = 1.0 - step(0.5, abs(k - uFocus));
    hide = (1.0 - match) * smoothstep(0.06, 0.28, uZoom);
  }

  // Driven by the contact form: the field tightens as the form completes.
  vAlpha *= mix(1.0, 1.7, uResolve);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float size = mix(0.9, 2.0, aRand) + vGold * 0.7 + beam * 0.9 + glow * 0.85 + vDetect * 0.8 + onGlyph * 0.45 + onHalo * core * 0.7 + device * sceneOff * 1.05 + (voiced + gear) * uSceneMix * 0.45;
  float px = size * uPixelRatio * (44.0 / max(-mv.z, 0.001));
  float cap = mix(18.0, mix(12.0, 7.5, uLite), uZoom);
  gl_PointSize = min(px, cap) * (1.0 - hide);
  if (hide > 0.97) {
    gl_Position = vec4(3.0, 3.0, 0.0, 1.0);
  } else {
    gl_Position = projectionMatrix * mv;
  }
}
`;

export const fragmentShader = /* glsl */ `
precision mediump float;

uniform vec3 uBase;
uniform vec3 uAccent;
uniform vec3 uDetect;

varying float vAlpha;
varying float vGold;
varying float vDetect;

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;

  float soft = smoothstep(0.25, 0.0, r2);
  vec3 c = mix(uBase, uAccent, vGold);
  c = mix(c, uDetect, vDetect);
  gl_FragColor = vec4(c, soft * vAlpha);
}
`;
