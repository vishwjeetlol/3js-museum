import * as THREE from 'three';

let group = null;
let mesh = null;
let isSpinning = true;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  // Magazine cover canvas
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#CF005E';
  ctx.fillRect(0, 0, 512, 700);

  // Canonical Marked Logo Slot (Untouched pink lockup)
  ctx.fillStyle = '#000000';
  ctx.fillRect(36, 40, 440, 90);
  ctx.fillStyle = '#CF005E';
  ctx.fillRect(40, 44, 432, 82);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 44, 432, 82);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 30px Bootzy, "Space Grotesk", Impact, sans-serif';
  ctx.fillText('NEPO BABY [LOGO SLOT]', 54, 94);

  ctx.fillStyle = '#FFDE59';
  ctx.font = '700 24px "SF Mono", "Space Mono", monospace';
  ctx.fillText('ISSUE #04: THE THREE.JS ERA', 40, 200);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 20px "SF Pro", "Inter", sans-serif';
  ctx.fillText('• 22 INTERACTIVE PAVILIONS', 40, 260);
  ctx.fillText('• REALTIME PROCEDURAL GLOSS', 40, 300);
  ctx.fillText('• Y2K RETROSPECTIVE', 40, 340);

  // Barcode
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(40, 600, 160, 50);
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 30; i++) {
    if (i % 2 === 0) ctx.fillRect(45 + i * 5, 605, 3, 40);
  }

  const texture = new THREE.CanvasTexture(canvas);

  // Book body
  const geometry = new THREE.BoxGeometry(2.4, 3.2, 0.25);
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // right spine/pages
    new THREE.MeshStandardMaterial({ color: 0xCF005E }), // left spine
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // top pages
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // bottom pages
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.1, metalness: 0.3 }), // front cover
    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 })  // back cover
  ];

  mesh = new THREE.Mesh(geometry, materials);
  group.add(mesh);

  scene.add(group);
  return group;
}

export function update(delta, time, isFocused) {
  if (!mesh) return;
  if (isSpinning || isFocused) {
    mesh.rotation.y += delta * 0.8;
  }
  mesh.position.y = Math.sin(time * 2) * 0.1;
}

export function setFocus(focused) {
  isSpinning = !focused;
  if (mesh) {
    mesh.rotation.set(0, 0, 0);
  }
}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    if (mesh) {
      mesh.geometry.dispose();
      mesh.material.forEach(m => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
    group = null;
    mesh = null;
  }
}
