import * as THREE from 'three';

let group = null;
let handset = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.6, plinthPos.z);

  // Classic Yellow PCO booth body
  const boothMat = new THREE.MeshStandardMaterial({
    color: 0xFFDE59,
    roughness: 0.3
  });

  const booth = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.6, 2.0), boothMat);
  group.add(booth);

  // Black trim & outline
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(2.08, 3.68, 2.08),
    new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
  );
  group.add(trim);

  // Glass viewing windows
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x5CE1E6,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    transmission: 0.8
  });
  const windowL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), glassMat);
  windowL.position.set(-1.01, 0.4, 0);
  windowL.rotation.y = -Math.PI / 2;
  group.add(windowL);

  const windowR = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), glassMat);
  windowR.position.set(1.01, 0.4, 0);
  windowR.rotation.y = Math.PI / 2;
  group.add(windowR);

  // PCO Illuminated Marquee Sign on Top
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 64;
  const sCtx = signCanvas.getContext('2d');
  sCtx.fillStyle = '#000000';
  sCtx.fillRect(0, 0, 256, 64);
  sCtx.fillStyle = '#FFDE59';
  sCtx.font = 'bold 36px "SF Mono", "Space Mono", monospace';
  sCtx.fillText('PCO • STD', 24, 46);

  const signTex = new THREE.CanvasTexture(signCanvas);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.4),
    new THREE.MeshBasicMaterial({ map: signTex })
  );
  sign.position.set(0, 1.6, 1.01);
  group.add(sign);

  // Telephone payphone unit inside / front
  const phoneBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.0, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xCF005E, roughness: 0.4 })
  );
  phoneBox.position.set(0, 0.2, 1.05);
  group.add(phoneBox);

  // Handset receiver
  handset = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.7, 12),
    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 })
  );
  handset.rotation.z = Math.PI / 2;
  handset.position.set(0, 0.45, 1.25);
  group.add(handset);

  scene.add(group);
  return group;
}

export function update(delta, time, isFocused) {
  if (!group) return;
  if (handset && isFocused) {
    // Ringing vibration
    handset.position.y = 0.45 + Math.sin(time * 30) * 0.02;
  }
  group.rotation.y = Math.sin(time * 0.3) * 0.2;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    handset = null;
  }
}
