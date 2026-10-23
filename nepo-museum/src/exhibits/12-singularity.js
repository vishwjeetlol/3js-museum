import * as THREE from 'three';

let group = null;
let points = null;
const count = 140000;
let morphTime = 0;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 3.0, plinthPos.z);

  const geo = new THREE.BufferGeometry();
  const posA = new Float32Array(count * 3);
  const posB = new Float32Array(count * 3);
  const posC = new Float32Array(count * 3);
  const posD = new Float32Array(count * 3);
  const currentPos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const idx = i * 3;

    // 1. Galaxy Singularity (Spiral Core)
    const arm = i % 4;
    const r = Math.pow(Math.random(), 1.5) * 3.5;
    const theta = r * 3.0 + (arm * (Math.PI * 2 / 4));
    posA[idx] = Math.cos(theta) * r + (Math.random() - 0.5) * 0.2;
    posA[idx + 1] = (Math.random() - 0.5) * (0.8 / (r + 0.5));
    posA[idx + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 0.2;

    // 2. Hypersphere
    const u = Math.random();
    const v = Math.random();
    const thetaS = u * 2.0 * Math.PI;
    const phiS = Math.acos(2.0 * v - 1.0);
    const rS = 2.4 * Math.cbrt(Math.random());
    posB[idx] = rS * Math.sin(phiS) * Math.cos(thetaS);
    posB[idx + 1] = rS * Math.sin(phiS) * Math.sin(thetaS);
    posB[idx + 2] = rS * Math.cos(phiS);

    // 3. Torus
    const uT = Math.random() * Math.PI * 2;
    const vT = Math.random() * Math.PI * 2;
    const R = 2.0;
    const rT = 0.7;
    posC[idx] = (R + rT * Math.cos(vT)) * Math.cos(uT);
    posC[idx + 1] = rT * Math.sin(vT);
    posC[idx + 2] = (R + rT * Math.cos(vT)) * Math.sin(uT);

    // 4. DNA Double Helix
    const tDNA = (i / count) * 40 - 20;
    const strand = (i % 2 === 0) ? 0 : Math.PI;
    const rDNA = 1.2;
    posD[idx] = Math.cos(tDNA * 0.5 + strand) * rDNA + (Math.random() - 0.5) * 0.2;
    posD[idx + 1] = tDNA * 0.15;
    posD[idx + 2] = Math.sin(tDNA * 0.5 + strand) * rDNA + (Math.random() - 0.5) * 0.2;

    // Initial position
    currentPos[idx] = posA[idx];
    currentPos[idx + 1] = posA[idx + 1];
    currentPos[idx + 2] = posA[idx + 2];

    // Colors: Y2K Pink to Aqua gradient
    const cChoice = Math.random();
    if (cChoice < 0.33) {
      // #CF005E (Pink)
      colors[idx] = 0.81; colors[idx + 1] = 0.0; colors[idx + 2] = 0.37;
    } else if (cChoice < 0.66) {
      // #5CE1E6 (Aqua)
      colors[idx] = 0.36; colors[idx + 1] = 0.88; colors[idx + 2] = 0.90;
    } else {
      // #BDFF52 (Lime)
      colors[idx] = 0.74; colors[idx + 1] = 1.0; colors[idx + 2] = 0.32;
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.userData = { posA, posB, posC, posD };

  const mat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  points = new THREE.Points(geo, mat);
  group.add(points);

  scene.add(group);
  return group;
}

export function update(delta, time) {
  if (!points) return;
  morphTime += delta * 0.4;
  const cycle = (morphTime % 4);
  const state = Math.floor(cycle);
  const factor = cycle - state;

  const { posA, posB, posC, posD } = points.geometry.userData;
  const shapes = [posA, posB, posC, posD];
  const from = shapes[state];
  const to = shapes[(state + 1) % 4];

  const pos = points.geometry.attributes.position;
  // Step through positions with smooth hermite interpolation
  const s = factor * factor * (3 - 2 * factor);
  for (let i = 0; i < pos.count; i++) {
    const idx = i * 3;
    pos.setXYZ(
      i,
      from[idx] + (to[idx] - from[idx]) * s,
      from[idx + 1] + (to[idx + 1] - from[idx + 1]) * s,
      from[idx + 2] + (to[idx + 2] - from[idx + 2]) * s
    );
  }
  pos.needsUpdate = true;
  group.rotation.y += delta * 0.4;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    if (points) {
      points.geometry.dispose();
      points.material.dispose();
    }
    group = null;
    points = null;
  }
}
