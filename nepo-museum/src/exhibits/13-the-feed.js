import * as THREE from 'three';

let group = null;
let items = [];
let currentFormation = 0;
let formationTimer = 0;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 3.0, plinthPos.z);

  items = [];
  const itemCount = 32;

  // Materials
  const pageMat = new THREE.MeshStandardMaterial({
    color: 0xCF005E,
    roughness: 0.2,
    side: THREE.DoubleSide
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x5CE1E6,
    metalness: 0.95,
    roughness: 0.05
  });

  const starburstMat = new THREE.MeshBasicMaterial({
    color: 0xFFDE59,
    wireframe: true
  });

  for (let i = 0; i < itemCount; i++) {
    let mesh;
    const type = i % 3;
    if (type === 0) {
      // Magazine page
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1), pageMat);
    } else if (type === 1) {
      // Chrome balloon
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), chromeMat);
    } else {
      // Starburst
      mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), starburstMat);
    }

    mesh.userData = {
      index: i,
      basePos: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      targetRot: new THREE.Euler()
    };

    group.add(mesh);
    items.push(mesh);
  }

  calculateFormations(0);

  scene.add(group);
  return group;
}

function calculateFormations(formationIndex) {
  const count = items.length;

  items.forEach((item, i) => {
    const t = i / count;

    if (formationIndex === 0) {
      // 1. Ring formation
      const angle = t * Math.PI * 2;
      const radius = 2.2;
      item.userData.targetPos.set(Math.cos(angle) * radius, Math.sin(i * 0.5) * 0.3, Math.sin(angle) * radius);
      item.userData.targetRot.set(0, -angle, 0);
    } else if (formationIndex === 1) {
      // 2. Helix formation
      const angle = t * Math.PI * 6;
      const radius = 1.4;
      const height = (t - 0.5) * 3.6;
      item.userData.targetPos.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      item.userData.targetRot.set(0, -angle, 0);
    } else if (formationIndex === 2) {
      // 3. Big Wheel formation
      const angle = t * Math.PI * 2;
      const radius = 2.4;
      item.userData.targetPos.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      item.userData.targetRot.set(0, 0, angle);
    } else {
      // 4. Chaos Pile
      item.userData.targetPos.set(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 2.5
      );
      item.userData.targetRot.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
    }
  });
}

export function update(delta, time) {
  if (!group) return;

  formationTimer += delta;
  if (formationTimer > 4.0) {
    formationTimer = 0;
    currentFormation = (currentFormation + 1) % 4;
    calculateFormations(currentFormation);
  }

  items.forEach((item) => {
    // Smooth lerp to target positions
    item.position.lerp(item.userData.targetPos, delta * 3.0);
    item.rotation.x += delta * 0.5;
    item.rotation.y += delta * 0.8;
  });

  group.rotation.y += delta * 0.2;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    items = [];
  }
}
