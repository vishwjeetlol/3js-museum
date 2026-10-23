import * as THREE from 'three';

let group = null;
let crank = null;
let capsules = [];

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.5, plinthPos.z);

  // Red/Pink stand base
  const baseGeo = new THREE.CylinderGeometry(1.0, 1.2, 1.4, 24);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xCF005E, roughness: 0.3 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.7;
  group.add(base);

  // Glass sphere globe
  const globeGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const globeMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.25,
    roughness: 0.05,
    transmission: 0.9
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  globe.position.y = 2.1;
  group.add(globe);

  // Metal turn crank
  crank = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.08, 16, 24),
    new THREE.MeshStandardMaterial({ color: 0xFFDE59, metalness: 0.8, roughness: 0.2 })
  );
  crank.position.set(0, 0.8, 1.15);
  group.add(crank);

  // Prize capsules inside globe
  capsules = [];
  const colors = [0xBDFF52, 0xCF005E, 0x5CE1E6, 0xFFDE59];
  for (let i = 0; i < 12; i++) {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.3 })
    );
    cap.position.set(
      (Math.random() - 0.5) * 1.2,
      1.7 + Math.random() * 0.8,
      (Math.random() - 0.5) * 1.2
    );
    group.add(cap);
    capsules.push(cap);
  }

  scene.add(group);
  return group;
}

export function update(delta, time, isFocused) {
  if (!group) return;
  if (crank) crank.rotation.z += delta * (isFocused ? 3.0 : 0.8);
  group.rotation.y = Math.sin(time * 0.3) * 0.2;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    capsules = [];
  }
}
