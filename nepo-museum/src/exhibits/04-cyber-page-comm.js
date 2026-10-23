import * as THREE from 'three';

let group = null;
let wireMesh = null;
let particles = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  // Wireframe sheet
  const wireGeo = new THREE.PlaneGeometry(2.4, 3.2, 16, 16);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x5CE1E6,
    wireframe: true
  });
  wireMesh = new THREE.Mesh(wireGeo, wireMat);
  group.add(wireMesh);

  // Particle data packets radiating outward
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 3;
    positions[i + 1] = (Math.random() - 0.5) * 4;
    positions[i + 2] = (Math.random() - 0.5) * 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xBDFF52,
    size: 0.05,
    transparent: true,
    opacity: 0.8
  });
  particles = new THREE.Points(pGeo, pMat);
  group.add(particles);

  scene.add(group);
  return group;
}

export function update(delta, time) {
  if (!group) return;
  group.rotation.y += delta * 0.5;
  if (particles) {
    const pos = particles.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let z = pos.getZ(i) + delta * 1.5;
      if (z > 2) z = -2;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  }
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    if (wireMesh) {
      wireMesh.geometry.dispose();
      wireMesh.material.dispose();
    }
    if (particles) {
      particles.geometry.dispose();
      particles.material.dispose();
    }
    group = null;
  }
}
