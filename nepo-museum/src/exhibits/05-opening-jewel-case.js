import * as THREE from 'three';

let group = null;
let lidPivot = null;
let discMesh = null;
let targetLidAngle = Math.PI * 0.65;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  const clearMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.8
  });

  // Base tray
  const trayGeo = new THREE.BoxGeometry(2.4, 0.1, 2.4);
  const tray = new THREE.Mesh(trayGeo, new THREE.MeshStandardMaterial({ color: 0x000000 }));
  group.add(tray);

  // Clear hinged lid
  lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.05, -1.2);
  const lid = new THREE.Mesh(trayGeo, clearMat);
  lid.position.set(0, 0, 1.2);
  lidPivot.add(lid);
  group.add(lidPivot);

  // Holographic compact disc
  const discGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.02, 32);
  const discMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    metalness: 0.95,
    roughness: 0.1
  });
  discMesh = new THREE.Mesh(discGeo, discMat);
  discMesh.position.set(0, 0.12, 0);
  group.add(discMesh);

  scene.add(group);
  return group;
}

export function update(delta, time, isFocused) {
  if (!group) return;
  const target = isFocused ? targetLidAngle : (Math.sin(time * 2) * 0.5 + 0.5) * Math.PI * 0.5;
  lidPivot.rotation.x = -target;

  if (discMesh) {
    discMesh.rotation.y += delta * 3.0;
  }
  group.rotation.y = Math.sin(time * 0.4) * 0.2;
}

export function setFocus(focused) {
  targetLidAngle = focused ? Math.PI * 0.75 : 0;
}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
  }
}
