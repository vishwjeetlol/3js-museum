import * as THREE from 'three';

let group = null;
let spools = [];
let speakers = [];

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.6, plinthPos.z);

  // Boombox main chassis (Chrome White)
  const bodyGeo = new THREE.BoxGeometry(3.6, 2.0, 1.2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    metalness: 0.9,
    roughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Handle on top
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.4, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x000000 })
  );
  handle.position.set(0, 1.2, 0);
  group.add(handle);

  // Dual Speakers on Left and Right
  speakers = [];
  const spGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 24);
  const spMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.8 });

  const spL = new THREE.Mesh(spGeo, spMat);
  spL.rotation.x = Math.PI / 2;
  spL.position.set(-1.1, 0, 0.61);
  group.add(spL);
  speakers.push(spL);

  const spR = new THREE.Mesh(spGeo, spMat);
  spR.rotation.x = Math.PI / 2;
  spR.position.set(1.1, 0, 0.61);
  group.add(spR);
  speakers.push(spR);

  // Cassette Deck in center with clear window
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.9, 0.05),
    new THREE.MeshPhysicalMaterial({ color: 0x5CE1E6, transparent: true, opacity: 0.5 })
  );
  deck.position.set(0, 0, 0.62);
  group.add(deck);

  // Spinning tape spools
  spools = [];
  const spoolGeo = new THREE.TorusGeometry(0.18, 0.04, 12, 16);
  const spoolMat = new THREE.MeshBasicMaterial({ color: 0xFFDE59 });

  const spool1 = new THREE.Mesh(spoolGeo, spoolMat);
  spool1.position.set(-0.25, 0, 0.64);
  group.add(spool1);
  spools.push(spool1);

  const spool2 = new THREE.Mesh(spoolGeo, spoolMat);
  spool2.position.set(0.25, 0, 0.64);
  group.add(spool2);
  spools.push(spool2);

  // LED VU meter bar on top of deck
  const vuMat = new THREE.MeshBasicMaterial({ color: 0xBDFF52 });
  const vuBar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 0.05), vuMat);
  vuBar.position.set(0, 0.6, 0.62);
  group.add(vuBar);

  scene.add(group);
  return group;
}

export function update(delta, time) {
  if (!group) return;
  // Spin cassette spools
  spools.forEach(s => {
    s.rotation.z -= delta * 4.0;
  });

  // Pulse speakers on the beat
  const bass = Math.abs(Math.sin(time * 8.0)) * 0.15;
  speakers.forEach(sp => {
    sp.scale.set(1.0 + bass, 1.0, 1.0 + bass);
  });

  group.rotation.y = Math.sin(time * 0.4) * 0.2;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    spools = [];
    speakers = [];
  }
}
