import * as THREE from 'three';

let group = null;
let flashLight = null;
let photoStrip = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.5, plinthPos.z);

  // Booth housing
  const boothGeo = new THREE.BoxGeometry(2.4, 3.4, 1.8);
  const boothMat = new THREE.MeshStandardMaterial({ color: 0xCF005E, roughness: 0.3 });
  const booth = new THREE.Mesh(boothGeo, boothMat);
  group.add(booth);

  // Curtain entrance
  const curtain = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.6, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xFFDE59, roughness: 0.8 })
  );
  curtain.position.set(0, -0.2, 0.91);
  group.add(curtain);

  // Neon "PHOTO" marquee sign on top
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.5, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x5CE1E6 })
  );
  sign.position.set(0, 1.9, 0.8);
  group.add(sign);

  // Camera strobe light inside
  flashLight = new THREE.PointLight(0xFFFFFF, 0, 10);
  flashLight.position.set(0, 0.5, 0.8);
  group.add(flashLight);

  // Printed 4-frame sticker strip hanging out
  const stripGeo = new THREE.PlaneGeometry(0.6, 2.0);
  const stripMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  photoStrip = new THREE.Mesh(stripGeo, stripMat);
  photoStrip.position.set(1.4, -0.4, 0.5);
  photoStrip.rotation.y = -Math.PI / 4;
  group.add(photoStrip);

  scene.add(group);
  return group;
}

export function update(delta, time, isFocused) {
  if (!group) return;
  // Flash camera strobe periodically
  const flashCycle = Math.sin(time * 3);
  if (flashLight) {
    flashLight.intensity = flashCycle > 0.95 ? 4.0 : 0.0;
  }
  group.rotation.y = Math.sin(time * 0.4) * 0.15;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    flashLight = null;
    photoStrip = null;
  }
}
