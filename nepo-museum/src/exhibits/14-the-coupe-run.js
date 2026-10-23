import * as THREE from 'three';

let group = null;
let roadMesh = null;
let car = null;
let wheels = [];
let flutterMag = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 1.2, plinthPos.z);

  // Endless road segment
  const roadGeo = new THREE.PlaneGeometry(3.6, 12, 1, 20);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.8
  });
  roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  group.add(roadMesh);

  // Road neon dash stripes
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFDE59 });
  for (let i = -5; i < 6; i += 2) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.8), lineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.02, i);
    group.add(dash);
  }

  // Speeding Coupe
  car = new THREE.Group();
  car.position.set(0, 0.5, 0);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.6, 3.8),
    new THREE.MeshStandardMaterial({ color: 0xCF005E, metalness: 0.8, roughness: 0.2 })
  );
  car.add(body);

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.5, 1.8),
    new THREE.MeshPhysicalMaterial({ color: 0x5CE1E6, transmission: 0.8, roughness: 0.1 })
  );
  glass.position.set(0, 0.5, -0.2);
  car.add(glass);

  // Wheels
  wheels = [];
  const wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
  const wMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const wPositions = [
    [-0.95, -0.1, 1.2],
    [0.95, -0.1, 1.2],
    [-0.95, -0.1, -1.2],
    [0.95, -0.1, -1.2]
  ];
  wPositions.forEach(([wx, wy, wz]) => {
    const w = new THREE.Mesh(wGeo, wMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, wy, wz);
    car.add(w);
    wheels.push(w);
  });

  // Fluttering magazine flapping in wind stream
  flutterMag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.7),
    new THREE.MeshBasicMaterial({ color: 0xBDFF52, side: THREE.DoubleSide })
  );
  flutterMag.position.set(0.5, 0.8, -1.4);
  car.add(flutterMag);

  group.add(car);

  scene.add(group);
  return group;
}

export function update(delta, time) {
  if (!car) return;
  // Spin wheels fast
  wheels.forEach(w => {
    w.rotation.x += delta * 15.0;
  });

  // Flutter magazine in turbulence
  if (flutterMag) {
    flutterMag.rotation.x = Math.sin(time * 25) * 0.4;
    flutterMag.rotation.y = Math.cos(time * 20) * 0.3;
  }

  // Car suspension bounce
  car.position.y = 0.5 + Math.sin(time * 12) * 0.02;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    roadMesh = null;
    car = null;
    wheels = [];
    flutterMag = null;
  }
}
