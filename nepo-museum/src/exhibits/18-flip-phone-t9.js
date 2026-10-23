import * as THREE from 'three';

let group = null;
let topLidPivot = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  // Clear Translucent Polycarbonate material
  const clearMat = new THREE.MeshPhysicalMaterial({
    color: 0x5CE1E6,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.85,
    transparent: true,
    opacity: 0.6
  });

  // Base Phone body (Keypad half)
  const baseGeo = new THREE.BoxGeometry(1.2, 1.8, 0.25);
  const base = new THREE.Mesh(baseGeo, clearMat);
  base.position.set(0, -0.6, 0);
  group.add(base);

  // Keypad keys
  const keyMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const key = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.05), keyMat);
      key.position.set(-0.3 + c * 0.3, -0.3 - r * 0.25, 0.15);
      group.add(key);
    }
  }

  // Antenna stub
  const ant = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x000000 })
  );
  ant.position.set(0.45, 0.4, 0);
  group.add(ant);

  // Top Clamshell Lid with Screen (Hinged at y=0.3)
  topLidPivot = new THREE.Group();
  topLidPivot.position.set(0, 0.3, 0);

  const topLid = new THREE.Mesh(baseGeo, clearMat);
  topLid.position.set(0, 0.9, 0);
  topLidPivot.add(topLid);

  // Backlit Green Monochrome LCD
  const lcdGeo = new THREE.PlaneGeometry(0.8, 1.0);
  const lcdMat = new THREE.MeshBasicMaterial({ color: 0xBDFF52 });
  const lcd = new THREE.Mesh(lcdGeo, lcdMat);
  lcd.position.set(0, 0.9, 0.13);
  topLidPivot.add(lcd);

  group.add(topLidPivot);

  scene.add(group);
  return group;
}

export function update(delta, time, isFocused) {
  if (!group) return;
  // Clamshell opening angle
  const angle = isFocused ? Math.PI * 0.8 : (Math.sin(time * 1.5) * 0.4 + 0.4) * Math.PI * 0.7;
  if (topLidPivot) {
    topLidPivot.rotation.x = -angle;
  }
  group.rotation.y = Math.sin(time * 0.5) * 0.25;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    topLidPivot = null;
  }
}
