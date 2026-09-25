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
uniform vec2 uPointer;
uniform float uAspect;
uniform float uFieldGlow;
uniform float uFocus;
uniform float uFocusAge;
uniform float uZoom;
uniform float uZoomOn;
uniform float uIconSpin;
uniform float uLite;
uniform float uMobile;
uniform float uScene;
uniform float uSceneMix;
uniform float uCols;
uniform float uRows;

attribute vec2 aUV;
attribute float aRand;
// Accent membership is its own random. Deriving it from aRand would tie the
// accent to whatever aRand also selects — every gold point would land in the
// same industry cluster and the same coverage tier.
attribute float aGold;

varying float vAlpha;
varying float vGold;
varying float vDetect;
varying float vSheet;

float hash21(float x, float y) {
  float n = fract(x * 12.9898 + y * 78.233);
  return fract(n * n * 45.233);
}

// Lattice coordinates include both edges so a grid meets its frame. On a
// closed loop that stacks the first and last column on one angle.
float loopAngle(float t, float n) {
  return t * (n - 1.0) / max(n, 1.0) * TAU;
}

// One lattice column (or row) per ruled line, plus the far edge so the
// frame still closes. A wide window around the line was lighting the
// neighbour as well, which read as two lines on top of each other.
float onLattice(float t, float n, float every) {
  float index = floor(t * (n - 1.0) + 0.5);
  float stride = max(1.0, floor(n / every + 0.5));
  // Stretch the stride so the last column lands on a line. Forcing that
  // edge on by itself left a shorter gap than the rest of the grid.
  float gaps = max(1.0, floor((n - 1.0) / stride));
  float spacing = (n - 1.0) / gaps;
  float nearest = round(index / spacing) * spacing;
  return 1.0 - step(0.5, abs(index - nearest));
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

// Straight bars. along walks the length, across the width. Twin of barX/barY.
vec3 barX(float x0, float x1, float y, float z, float along, float across, float width) {
  float t = clamp(along, 0.0, 1.0);
  return vec3(x0 + (x1 - x0) * t, y + (across - 0.5) * width, z);
}

vec3 barY(float x, float y0, float y1, float z, float along, float across, float width) {
  float t = clamp(along, 0.0, 1.0);
  return vec3(x + (across - 0.5) * width, y0 + (y1 - y0) * t, z);
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
    if (part < 0.14) p = faceFrame(u, v, -1.2, -0.12, 0.12, 1.22, 0.28, 0.0, 0.07);
    else if (part < 0.24) p = faceFrame(u, v, -0.28, 0.28, 0.12, 1.22, -1.2, 1.0, 0.05);
    else if (part < 0.32) p = faceFrame(u, v, -1.2, -0.12, -0.28, 0.28, 1.22, 2.0, 0.05);
    else if (part < 0.46) p = faceFrame(u, v, 0.18, 0.95, -0.7, 1.28, 0.48, 0.0, 0.06);
    else if (part < 0.6) {
      float bay = min(floor(u * 4.0), 3.0);
      p = vec3(0.28 + v * 0.55, -0.42 + bay * 0.4, 0.52);
    }     else if (part < 0.74) p = faceFrame(u, v, -0.48, 0.48, -0.7, 1.28, 0.95, 1.0, 0.05);
    else if (part < 0.82) p = faceFrame(u, v, 0.18, 0.95, -0.48, 0.48, 1.28, 2.0, 0.05);
    else if (part < 0.88) p = standNeck(-0.62, 0.12, -0.5, u, v);
    else p = vec3(-1.2 + u * 1.16, -0.5, -0.42 + v * 0.84);
  }
  return p;
}

vec3 hardwareLocal(float which, vec3 seed) {
  float part = fract(seed.x * 4.17);
  float u = seed.y;
  float v = seed.z;
  float w = 0.16;
  vec3 p = barX(-0.85, 0.85, -0.8, 0.0, u, v, w);
  if (which < 0.5) {
    p = barX(-1.45, 1.45, -0.98, -0.14, u, v, w);
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
    else if (part < 0.78) p = barY(0.0, 0.05, -0.72, 0.0, u, v, w);
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

// Rotary desk phone. Twin of phoneLocal() in formations.ts.
// One result, assigned through, so ANGLE keeps it initialised.
vec3 phoneLocal(vec3 seed) {
  float part = fract(seed.x * 6.4);
  float sub = fract(seed.x * 17.3);
  float u = seed.y;
  float v = seed.z;
  float spin = v * TAU * 0.992;
  float uu = clamp((u - 0.05) / 0.95, 0.0, 1.0);
  float a = uu * 11.0 * TAU;
  float rad = 0.4;
  float x0 = -2.2;
  float y0 = 1.15;
  float x1 = -6.5;
  float y1 = -1.55;
  float cx = x0 + (x1 - x0) * uu;
  float cy = y0 + (y1 - y0) * uu;
  float dx = x1 - x0;
  float dy = y1 - y0;
  float len = max(length(vec2(dx, dy)), 0.001);
  float nx = -dy / len;
  float ny = dx / len;
  vec3 p = vec3(cx + cos(a) * nx * rad, cy + cos(a) * ny * rad, 0.2 + sin(a) * rad * 0.75);
  if (part < 0.16) {
    p = faceFrame(u, v, -2.6, 2.6, -1.45, 1.55, -2.15, 2.0, 0.05);
    if (sub < 0.18) p = faceFrame(u, v, -2.6, 2.6, -2.15, -1.2, 1.55, 0.0, 0.07);
    else if (sub < 0.36) p = faceFrame(u, v, -2.6, 2.6, -2.15, -1.2, -1.45, 0.0, 0.07);
    else if (sub < 0.5) p = faceFrame(u, v, -1.45, 1.55, -2.15, -1.2, -2.6, 1.0, 0.06);
    else if (sub < 0.64) p = faceFrame(u, v, -1.45, 1.55, -2.15, -1.2, 2.6, 1.0, 0.06);
    else if (sub < 0.84) p = faceFrame(u, v, -2.6, 2.6, -1.45, 1.55, -1.2, 2.0, 0.06);
  } else if (part < 0.3) {
    float cnr = min(floor(u * 4.0), 3.0);
    float isLeft = 1.0 - step(1.5, cnr);
    float isBack = 1.0 - step(0.5, mod(cnr, 2.0));
    float bx = mix(2.15, -2.15, isLeft);
    float tx = mix(1.5, -1.5, isLeft);
    float bz = mix(1.45, -1.2, isBack);
    float tz = mix(0.8, -0.75, isBack);
    p = vec3(bx + (tx - bx) * v, -1.2 + 1.82 * v, bz + (tz - bz) * v);
    if (sub < 0.4) p = faceFrame(u, v, -1.35, 1.35, -1.15, 0.4, 1.62, 0.0, 0.06);
    else if (sub < 0.62) p = faceFrame(u, v, -1.5, 1.5, -0.75, 0.8, 0.62, 2.0, 0.055);
  } else if (part < 0.48) {
    float x = -1.75 + u * 3.5;
    float arch = sin(u * 3.14159265) * 0.38;
    float w = (v - 0.5) * 0.32;
    p = vec3(x, 1.28 + arch + w * 0.35, w);
    if (sub < 0.28) {
      float r = 0.42 + u * 0.28;
      p = vec3(-2.15 + cos(spin) * r, 1.2 + sin(spin) * r * 0.75, 0.1);
    } else if (sub < 0.54) {
      float r = 0.38 + u * 0.24;
      p = vec3(2.15 + cos(spin) * r, 1.12 + sin(spin) * r * 0.7, 0.1);
    }
  } else if (part < 0.68) {
    float hx = 0.05;
    float hy = -0.42;
    float hz = 1.72;
    float stop = -0.7 + u * 0.55;
    p = vec3(hx + cos(stop) * (0.85 + v * 0.28), hy + sin(stop) * (0.85 + v * 0.28), hz + 0.06);
    if (sub < 0.32) {
      float r = 1.05 + (u - 0.5) * 0.1;
      p = vec3(hx + cos(spin) * r, hy + sin(spin) * r, hz);
    } else if (sub < 0.48) {
      float r = 0.32 + u * 0.12;
      p = vec3(hx + cos(spin) * r, hy + sin(spin) * r, hz + 0.05);
    } else if (sub < 0.9) {
      float hole = min(floor(u * 10.0), 9.0);
      float a0 = -1.15 + (hole / 10.0) * 5.1;
      float rr = 0.1 + v * 0.06;
      p = vec3(hx + cos(a0) * 0.66 + cos(spin) * rr, hy + sin(a0) * 0.66 + sin(spin) * rr, hz + 0.06);
    }
  } else if (part < 0.76) {
    float side = u < 0.5 ? -1.55 : 1.6;
    p = vec3(side + (fract(u * 2.0) - 0.5) * 0.12, 0.55 + v * 0.78, 0.02);
  }
  return p;
}

// Strategy-row pictures. Not chapter phases. Twin of serviceFormation().
vec3 serviceAt(int s, float t) {
  vec3 seed = position;
  vec3 p = vec3(0.0);
  if (s <= 0) {
    float a = loopAngle(aUV.x, uCols) + t * 0.15;
    float r = 1.2 + pow(aRand, 0.6) * 2.4;
    p = vec3(cos(a) * r * 1.25, sin(a) * r, (seed.z - 0.5) * 1.1);
  } else if (s == 1) {
    float a = loopAngle(aUV.x, uCols) + t * 0.04;
    float b = loopAngle(aUV.y, uRows);
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
    if (fract(aRand * 13.7) > 0.5) p = vec3(0.0, -40.0, 0.0);
    else {
      vec3 local = phoneLocal(seed);
      float yaw = -0.58 + sin(t * 0.4) * 0.1;
      float c = cos(yaw);
      float sn = sin(yaw);
      p = vec3(1.5 + local.x * c + local.z * sn, local.y - 0.1, -local.x * sn + local.z * c);
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
    float a = loopAngle(aUV.x, uCols) + tier * 0.6 + t * (0.05 + tier * 0.02);
    return vec3(cos(a) * r * 1.8, sin(a) * r, (seed.x - 0.5) * 0.8);
  }
  if (s == 3) {
    // Security: a perimeter closes around the interior.
    float onRing = step(0.3, aRand);
    float a = loopAngle(aUV.x, uCols) + t * 0.06;
    // sqrt spreads the interior evenly across the disc; a linear radius
    // piles everything into the centre.
    // Interior fills almost to the ring so the lighthouse shaft is a
    // continuous beam, not a disc and a rim with a dark moat between them.
    float r = mix(sqrt(seed.x) * 5.9, 6.4 + (seed.y - 0.5) * 0.28, onRing);
    return vec3(cos(a) * r * 1.8, sin(a) * r, (seed.z - 0.5) * 0.7);
  }
  if (s == 4) {
    // Industries: six clouds travel a sideways oval. The orbs turn
    // inside each cloud. A focused mark yaws only while zoomed.
    // Centre (4.2, 0.2), radii 5.8 and 4.3. Keep in step with formations.ts.
    float k = min(floor(aRand * 6.0), 5.0);
    float match = uFocus < 0.0 ? 0.0 : (1.0 - step(0.5, abs(k - uFocus)));
    float onTrail = step(0.34, seed.z) * (1.0 - step(0.1, fract(seed.x * 17.13)));
    // A zoom draws only the one cloud. The oval dusting stays in the wide
    // field, and the other five clouds are not computed.
    if (uZoomOn > 0.5 && uFocus >= 0.0 && (match < 0.5 || onTrail > 0.5)) {
      return vec3(0.0, -40.0, 0.0);
    }
    float a = k / 6.0 * TAU - 1.5707963 + t * 0.18;
    float extra = fract(aRand * 6.0);
    vec3 local = seed.z < 0.34 ? glyph(k, seed, extra) * 0.62 : halo(seed);
    float spin = seed.z < 0.34 ? uIconSpin * match : t * 0.62;
    local = yaw(local, spin);
    float along = 0.32 + fract(seed.y * 13.1) * 0.36;
    float trailA = a + along * (TAU / 6.0);
    float jitter = (fract(seed.x * 7.7) - 0.5) * 0.55;
    vec3 orb = vec3(cos(a) * 5.8 + 4.2 + local.x, sin(a) * 4.3 + 0.2 + local.y, local.z);
    vec3 path = vec3(
      cos(trailA) * (5.8 + jitter) + 4.2,
      sin(trailA) * (4.3 + jitter * 0.35) + 0.2,
      (seed.z - 0.5) * 0.35
    );
    return mix(orb, path, onTrail);
  }
  if (s == 5) {
    // Response: the filled disc, pitched so the middle sinks. vSheet is the
    // disc radius before that pitch, so the pulse rides the ellipse.
    // Spokes run to the bottom of the well and meet there.
    vec3 p = vec3(0.0);
    if (aRand < 0.04) {
      float az = seed.x * TAU;
      float cosP = seed.y * 2.0 - 1.0;
      float sinP = sqrt(max(0.0, 1.0 - cosP * cosP));
      float R = 0.55 * pow(seed.z, 0.7);
      p = vec3(cos(az) * sinP * R, cosP * R, sin(az) * sinP * R);
    } else {
      float a = loopAngle(aUV.x, uCols) + t * 0.015;
      float rad = sqrt(seed.x) * 6.5;
      float grid = 1.0 - step(0.22, fract(aRand * 7.13));
      if (grid > 0.5) {
        float spoke = step(0.5, fract(aRand * 3.1));
        float ring = min(floor(seed.y * 10.0), 9.0);
        float spk = min(floor(seed.y * 12.0), 11.0);
        float ringR = 1.15 + ring * 0.55;
        float spokeR = seed.x * 6.48;
        // Keep dots in proportion to line length so the inner rings and the
        // meeting point are not a pile of the same count.
        float keep = mix(mix(0.55, 1.0, ringR / 6.1), mix(0.5, 1.0, spokeR / 6.48), spoke);
        if (fract(seed.z * 13.7) <= keep) {
          rad = mix(ringR, spokeR, spoke);
          a = mix(a, spk / 12.0 * TAU + t * 0.015, spoke);
        }
      }
      float well = 1.7 * exp(-rad * rad / 1.5);
      vSheet = rad;
      p = vec3(cos(a) * rad * 1.55, sin(a) * rad - well, (seed.z - 0.5) * 0.28 - well * 0.45);
    }
    return p;
  }
  // Strategy pages use the same drifting cloud as Unmanaged.
  return vec3(
    (seed.x - 0.5) * 30.0 + sin(t * 0.18 + seed.y * TAU) * 0.9,
    (seed.y - 0.5) * 17.0 + cos(t * 0.15 + seed.z * TAU) * 0.7,
    (seed.z - 0.5) * 12.0
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
  return 0.55;
}

float serviceDensity(int s) {
  if (s <= 0) return 0.50;
  if (s == 1) return 0.28;
  if (s == 2) return 0.62;
  if (s == 3) return 0.4;
  if (s == 4) return 0.34;
  return 0.52;
}

void main() {
  float ph = clamp(uPhase, 0.0, 6.0);
  int a = int(floor(ph));
  int b = int(min(floor(ph) + 1.0, 6.0));
  float m = smoothstep(0.0, 1.0, fract(ph));

  vSheet = 0.0;
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

  // Flashlight in screen space. A circle on the field plane stretches toward
  // the edges of the view, so the radius is measured after projection.
  vec4 glowClip = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  vec2 glowDelta = glowClip.xy / glowClip.w - uPointer;
  glowDelta.x *= uAspect;
  float glow = smoothstep(0.70, 0.0, length(glowDelta)) * uFieldGlow;

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
      // The oval dusting is not part of a cloud, so a highlight does not
      // pull it forward or light it as a line off the orb.
      float onTrail = step(0.34, position.z) * (1.0 - step(0.1, fract(position.x * 17.13)));
      float dim = mix(0.32, 0.08, uZoom);
      float lift = mix(1.85, 2.1, uZoom);
      if (onTrail < 0.5) {
        vAlpha *= mix(dim, lift, match);
        pos.z += match * 1.5 * nearIndustries;
      }
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
    float onLine = max(onLattice(aUV.x, uCols, 42.0), onLattice(aUV.y, uRows, 24.0));
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

    // A few interior dots are threats. They stay out of the blue border,
    // glow red when the shaft hits them, and linger for about 1.5s.
    // The beam moves at 0.55 rad/s, so 0.84 rad behind it is that linger.
    float inside = (1.0 - step(0.3, aRand)) * (1.0 - smoothstep(4.6, 5.15, ellipseR));
    float marked = inside * step(0.999, aGold);
    float linger = smoothstep(-0.84, -0.50, da) * (1.0 - smoothstep(0.0, 0.02, da));
    vDetect = marked * nearSecurity * max(shaft, linger);
    vGold *= 1.0 - marked * nearSecurity;
    vAlpha *= mix(1.0, 5.5, vDetect);
  }

  // Response: the pulse uses the disc radius, so it stays on the ellipse.
  // The sphere is solid yellow and drawn with thicker dots.
  float nearResponse = (1.0 - clamp(abs(ph - 5.0), 0.0, 1.0)) * sceneOff;
  if (nearResponse > 0.0) {
    float front = mod(uTime * 0.9, 7.4);
    float band = smoothstep(0.62, 0.0, abs(vSheet - front));
    float die = 1.0 - smoothstep(5.2, 6.3, front);
    float pulse = band * die * step(0.15, vSheet);
    float onSphere = 1.0 - step(0.04, aRand);
    vGold = max(vGold, max(pulse, onSphere) * 0.85 * nearResponse);
    vAlpha *= mix(1.0, 1.7, pulse * nearResponse);
    float onGrid = step(0.04, aRand) * (1.0 - step(0.22, fract(aRand * 7.13)));
    float onSpoke = onGrid * step(0.5, fract(aRand * 3.1));
    float kept = step(fract(position.z * 13.7), mix(mix(0.55, 1.0, vSheet / 6.1), mix(0.5, 1.0, vSheet / 6.48), onSpoke));
    onGrid *= kept;
    vAlpha *= mix(1.0, 1.45, onGrid * nearResponse);
  }

  // Industry cloud glows from its own centre: hot in the middle, a faint
  // dusting at the rim. The mark is a small bright object inside that glow.
  float nearIndustries = (1.0 - clamp(abs(ph - 4.0), 0.0, 1.0)) * sceneOff;
  float onGlyph = (1.0 - step(0.34, position.z)) * nearIndustries;
  float onHalo = step(0.34, position.z) * nearIndustries;
  float core = 0.0;
  if (nearIndustries > 0.0) {
    float kk = min(floor(aRand * 6.0), 5.0);
    float ca = kk / 6.0 * 6.2831853 - 1.5707963 + uTime * 0.18;
    vec2 ctr = vec2(cos(ca) * 5.8 + 4.2, sin(ca) * 4.3 + 0.2);
    float rad = length(vec3(pos.x - ctr.x, pos.y - ctr.y, pos.z));
    core = pow(clamp(1.0 - rad / 2.5, 0.0, 1.0), 1.35);
    // Points on the oval are outside every cloud, so the halo falloff
    // would hide them. Keep that dusting at the ordinary point weight.
    float onTrail = step(0.34, position.z) * (1.0 - step(0.1, fract(position.x * 17.13)));
    onHalo *= 1.0 - onTrail;
  }
  vAlpha *= mix(1.0, 1.7, onGlyph);
  vAlpha *= mix(1.0, mix(0.16, 1.85, core), onHalo);
  vAlpha *= mix(1.0, 1.7, device * sceneOff);

  // A zoom shows only the focused cloud. Drop the other clusters and the
  // oval dusting on the first frame instead of fading them in.
  float hide = 0.0;
  if (nearIndustries > 0.0 && uFocus >= 0.0 && uZoomOn > 0.5) {
    float k = floor(aRand * 6.0);
    float match = 1.0 - step(0.5, abs(k - uFocus));
    float onTrail = step(0.34, position.z) * (1.0 - step(0.1, fract(position.x * 17.13)));
    hide = max(1.0 - match, onTrail);
  }

  // Driven by the contact form: the field tightens as the form completes.
  vAlpha *= mix(1.0, 1.7, uResolve);

  // Phones only. uMobile is 0 on desktop, so none of this moves the picture.
  // The discovery lattice turns upright so the tall frame can hold it.
  float onDiscovery = 1.0 - clamp(abs(ph - 1.0), 0.0, 1.0);
  pos.xy = mix(pos.xy, vec2(-pos.y, pos.x), onDiscovery * uMobile);
  // The drifting cloud (unmanaged and strategy) is widened in y until it
  // covers a 9:16 frame. Other formations keep the shared phone scale.
  float onCloud = max(1.0 - clamp(abs(ph), 0.0, 1.0), 1.0 - clamp(abs(ph - 6.0), 0.0, 1.0));
  vec2 fit = vec2(mix(1.0, 0.58, uMobile));
  pos.xy *= mix(fit, vec2(0.5, 1.22), onCloud * uMobile);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float onSpherePt = (1.0 - step(0.04, aRand)) * (1.0 - clamp(abs(ph - 5.0), 0.0, 1.0)) * sceneOff;
  float onGridPt = step(0.04, aRand) * (1.0 - step(0.22, fract(aRand * 7.13))) * (1.0 - clamp(abs(ph - 5.0), 0.0, 1.0)) * sceneOff;
  float onSpokePt = onGridPt * step(0.5, fract(aRand * 3.1));
  float keptPt = step(fract(position.z * 13.7), mix(mix(0.55, 1.0, vSheet / 6.1), mix(0.5, 1.0, vSheet / 6.48), onSpokePt));
  onGridPt *= keptPt;
  float size = mix(0.9, 2.0, aRand) + vGold * 0.7 + beam * 0.9 + glow * 0.85 + vDetect * 4.2 + onGlyph * 1.15 + onHalo * core * 0.7 + device * sceneOff * 1.05 + (voiced + gear) * uSceneMix * 0.45 + onSpherePt * 0.8 + onGridPt * 0.55;
  size *= mix(1.0, 1.25, uMobile);
  float px = size * uPixelRatio * (44.0 / max(-mv.z, 0.001));
  float cap = mix(18.0, mix(12.0, 7.5, uLite), uZoom) + onSpherePt * 2.0 + vDetect * 14.0;
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
varying float vSheet;

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;

  float soft = smoothstep(0.25, 0.0, r2);
  vec3 c = mix(uBase, uAccent, vGold);
  vec3 threat = mix(uDetect, vec3(1.0, 0.78, 0.62), smoothstep(0.18, 0.0, r2));
  c = mix(c, threat, vDetect);
  gl_FragColor = vec4(c, soft * vAlpha);
}
`;
