import * as THREE from 'three';

let group = null;
let points = null;
let currentShape = 0;
const shapeCount = 4;
let morphProgress = 0;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  const count = 15000;
  const geo = new THREE.BufferGeometry();
  const posA = new Float32Array(count * 3);
  const posB = new Float32Array(count * 3);
  const currentPos = new Float32Array(count * 3);

  // Generate shapes: Galaxy vs Sphere
  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    // Shape A: Spiral Galaxy
    const arm = i % 3;
    const r = Math.pow(Math.random(), 2) * 1.8;
    const theta = r * 4 + (arm * (Math.PI * 2 / 3));
    posA[idx] = Math.cos(theta) * r + (Math.random() - 0.5) * 0.2;
    posA[idx + 1] = (Math.random() - 0.5) * 0.3;
    posA[idx + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 0.2;

    // Shape B: Sphere
    const phi = Math.acos(2 * Math.random() - 1);
    const lam = 2 * Math.PI * Math.random();
    posB[idx] = 1.3 * Math.sin(phi) * Math.cos(lam);
    posB[idx + 1] = 1.3 * Math.sin(phi) * Math.sin(lam);
    posB[idx + 2] = 1.3 * Math.cos(phi);

    currentPos[idx] = posA[idx];
    currentPos[idx + 1] = posA[idx + 1];
    currentPos[idx + 2] = posA[idx + 2];
  }

  geo.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));
  geo.userData = { posA, posB };

  const mat = new THREE.PointsMaterial({
    color: 0xBDFF52,
    size: 0.04,
    transparent: true,
    opacity: 0.85
  });

  points = new THREE.Points(geo, mat);
  group.add(points);

  scene.add(group);
  return group;
}

export function update(delta, time) {
  if (!points) return;
  const progress = (Math.sin(time * 0.8) * 0.5 + 0.5);
  const pos = points.geometry.attributes.position;
  const { posA, posB } = points.geometry.userData;

  for (let i = 0; i < pos.count; i++) {
    const idx = i * 3;
    pos.setXYZ(
      i,
      posA[idx] + (posB[idx] - posA[idx]) * progress,
      posA[idx + 1] + (posB[idx + 1] - posA[idx + 1]) * progress,
      posA[idx + 2] + (posB[idx + 2] - posA[idx + 2]) * progress
    );
  }
  pos.needsUpdate = true;
  group.rotation.y += delta * 0.6;
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
