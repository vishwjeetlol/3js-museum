import * as THREE from 'three';

let group = null;
let screenMesh = null;
let shellMat = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.7, plinthPos.z);

  // Iconic teardrop Bondi Blue translucent plastic enclosure
  shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x5CE1E6,
    metalness: 0.1,
    roughness: 0.15,
    transmission: 0.85,
    transparent: true,
    opacity: 0.75,
    thickness: 0.6
  });

  const bodyGeo = new THREE.BoxGeometry(2.4, 2.2, 2.6);
  const body = new THREE.Mesh(bodyGeo, shellMat);
  group.add(body);

  // Inner White CRT Tube
  const tubeGeo = new THREE.BoxGeometry(2.0, 1.8, 1.8);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.3
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.position.set(0, 0, 0.2);
  group.add(tube);

  // Front Glass CRT Screen Face
  const screenGeo = new THREE.PlaneGeometry(1.8, 1.4);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0xBDFF52 });
  screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 0.1, 1.31);
  group.add(screenMesh);

  // Molded carry handle on top
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.08, 16, 24, Math.PI),
    shellMat
  );
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0, 1.15, 0);
  group.add(handle);

  scene.add(group);
  return group;
}

export function update(delta, time) {
  if (!group) return;
  // Gentle CRT glow pulse
  if (screenMesh) {
    const pulse = Math.sin(time * 4) * 0.1 + 0.9;
    screenMesh.material.color.setRGB(0.74 * pulse, 1.0 * pulse, 0.32 * pulse);
  }
  group.rotation.y += delta * 0.5;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    screenMesh = null;
    shellMat = null;
  }
}
