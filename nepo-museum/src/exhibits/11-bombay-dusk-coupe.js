import * as THREE from 'three';

let group = null;
let carGroup = null;
let turntable = null;
let wheels = [];

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 1.2, plinthPos.z);

  // Rotating circular showroom turntable
  const discGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.3, 36);
  const discMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.7,
    roughness: 0.3
  });
  turntable = new THREE.Mesh(discGeo, discMat);
  turntable.position.y = 0.15;
  group.add(turntable);

  // Turntable neon perimeter ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.7, 0.05, 16, 36),
    new THREE.MeshBasicMaterial({ color: 0xBDFF52 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.3;
  turntable.add(ring);

  // Attempt to load coupe.json or assemble procedural coupe
  carGroup = new THREE.Group();
  carGroup.position.y = 0.4;
  turntable.add(carGroup);

  // Procedural Coupe Chassis based on coupe.json specs
  const bodyGeo = new THREE.BoxGeometry(2.0, 0.7, 4.4);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xCF005E,
    metalness: 0.8,
    roughness: 0.2
  });
  const carBody = new THREE.Mesh(bodyGeo, bodyMat);
  carBody.position.y = 0.6;
  carGroup.add(carBody);

  // Sleek cabin glass
  const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 2.2);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x5CE1E6,
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.6,
    transparent: true,
    opacity: 0.6
  });
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(0, 1.15, -0.2);
  carGroup.add(cabin);

  // Headlights
  const lightGeo = new THREE.BoxGeometry(0.5, 0.15, 0.1);
  const headMat = new THREE.MeshBasicMaterial({ color: 0xFFDE59 });
  const lightL = new THREE.Mesh(lightGeo, headMat);
  lightL.position.set(-0.6, 0.6, 2.2);
  carGroup.add(lightL);

  const lightR = new THREE.Mesh(lightGeo, headMat);
  lightR.position.set(0.6, 0.6, 2.2);
  carGroup.add(lightR);

  // Wheels
  wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.25, 24);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.8 });
  const wheelOffsets = [
    [-1.05, 0.38, 1.3],
    [1.05, 0.38, 1.3],
    [-1.05, 0.38, -1.3],
    [1.05, 0.38, -1.3]
  ];

  wheelOffsets.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    carGroup.add(wheel);
    wheels.push(wheel);
  });

  scene.add(group);
  return group;
}

export function update(delta, time) {
  if (turntable) {
    turntable.rotation.y += delta * 0.4;
  }
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    turntable = null;
    carGroup = null;
    wheels = [];
  }
}
