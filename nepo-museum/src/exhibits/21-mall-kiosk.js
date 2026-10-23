import * as THREE from 'three';

let group = null;
let youAreHereDot = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.5, plinthPos.z);

  // Kiosk angled directory stand
  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 2.2, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5 })
  );
  stand.rotation.x = -Math.PI / 8;
  group.add(stand);

  // Backlit Acrylic Directory Board
  const boardGeo = new THREE.PlaneGeometry(2.3, 1.8);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background map grid
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 400);

  ctx.strokeStyle = '#5CE1E6';
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 400); ctx.stroke();
  }
  for (let y = 0; y < 400; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  // Header
  ctx.fillStyle = '#FFDE59';
  ctx.font = 'bold 22px "SF Mono", "Space Mono", monospace';
  ctx.fillText('MUSEUM DIRECTORY // MALL LEVEL 1', 30, 40);

  // Store Zones
  const zones = [
    { name: 'WING A: LOANS', color: '#BDFF52', x: 40, y: 80, w: 180, h: 120 },
    { name: 'WING B: ORIGINAL', color: '#CF005E', x: 260, y: 80, w: 210, h: 120 },
    { name: 'WING C: SHORTLIST', color: '#5CE1E6', x: 40, y: 230, w: 200, h: 120 },
    { name: 'GIFT SHOP', color: '#FFDE59', x: 270, y: 230, w: 200, h: 120 }
  ];

  zones.forEach(z => {
    ctx.fillStyle = z.color;
    ctx.strokeRect(z.x, z.y, z.w, z.h);
    ctx.font = 'bold 13px "SF Mono", "Space Mono", monospace';
    ctx.fillText(z.name, z.x + 12, z.y + 30);
  });

  const tex = new THREE.CanvasTexture(canvas);
  const board = new THREE.Mesh(boardGeo, new THREE.MeshBasicMaterial({ map: tex }));
  board.position.set(0, 0, 0.22);
  stand.add(board);

  // Pulsing "YOU ARE HERE" LED (Brand Pink)
  const dotGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xCF005E });
  youAreHereDot = new THREE.Mesh(dotGeo, dotMat);
  youAreHereDot.position.set(0, 0, 0.28);
  stand.add(youAreHereDot);

  scene.add(group);
  return group;
}

export function update(delta, time) {
  if (!group) return;
  if (youAreHereDot) {
    const scale = Math.sin(time * 8.0) * 0.4 + 1.0;
    youAreHereDot.scale.set(scale, scale, scale);
  }
  group.rotation.y = Math.sin(time * 0.3) * 0.15;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    youAreHereDot = null;
  }
}
