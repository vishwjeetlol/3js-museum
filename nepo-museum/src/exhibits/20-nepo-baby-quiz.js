import * as THREE from 'three';

let group = null;
let screenMesh = null;
let canvas = null;
let ctx = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.6, plinthPos.z);

  // Kiosk arcade pedestal
  const kiosk = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 3.4, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xCF005E, roughness: 0.3 })
  );
  group.add(kiosk);

  // Top header marquee
  const marquee = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.6, 0.4),
    new THREE.MeshBasicMaterial({ color: 0xFFDE59 })
  );
  marquee.position.set(0, 1.8, 0.3);
  group.add(marquee);

  // Touch screen interface canvas
  canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  ctx = canvas.getContext('2d');
  drawQuiz(0);

  const tex = new THREE.CanvasTexture(canvas);
  const sGeo = new THREE.PlaneGeometry(1.6, 1.4);
  const sMat = new THREE.MeshBasicMaterial({ map: tex });
  screenMesh = new THREE.Mesh(sGeo, sMat);
  screenMesh.position.set(0, 0.4, 0.71);
  group.add(screenMesh);

  // Big tactile push buttons below screen
  const bColors = [0xBDFF52, 0x5CE1E6, 0xFFDE59];
  bColors.forEach((col, i) => {
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.2 })
    );
    btn.rotation.x = Math.PI / 2;
    btn.position.set(-0.5 + i * 0.5, -0.6, 0.72);
    group.add(btn);
  });

  scene.add(group);
  return group;
}

function drawQuiz(time) {
  if (!ctx) return;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 384);

  // Header banner
  ctx.fillStyle = '#CF005E';
  ctx.fillRect(0, 0, 512, 60);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px "SF Mono", "Space Mono", monospace';
  ctx.fillText('WHICH NEPO BABY ARE YOU?', 60, 40);

  // Question box
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '16px "SF Pro", "Inter", sans-serif';
  ctx.fillText('Q1: Your dad produces films. You are:', 30, 100);

  // Options
  const options = [
    { key: '[A]', text: 'Launching a hyper-curated print mag' },
    { key: '[B]', text: 'Directing low-poly 3D music videos' },
    { key: '[C]', text: 'Driving a Bombay Dusk Coupe to Soho' }
  ];

  options.forEach((opt, i) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(30, 130 + i * 50, 452, 40);
    ctx.strokeStyle = '#BDFF52';
    ctx.strokeRect(30, 130 + i * 50, 452, 40);

    ctx.fillStyle = '#FFDE59';
    ctx.font = 'bold 16px "SF Mono", "Space Mono", monospace';
    ctx.fillText(opt.key, 45, 156 + i * 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px "SF Pro", "Inter", sans-serif';
    ctx.fillText(opt.text, 90, 156 + i * 50);
  });

  // Footer status
  ctx.fillStyle = '#5CE1E6';
  ctx.font = '13px monospace';
  ctx.fillText('PRESS [A], [B] OR [C] TO SUBMIT VOTE', 80, 340);
}

export function update(delta, time) {
  if (!group) return;
  drawQuiz(time);
  if (screenMesh && screenMesh.material.map) {
    screenMesh.material.map.needsUpdate = true;
  }
  group.rotation.y = Math.sin(time * 0.3) * 0.15;
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    screenMesh = null;
    canvas = null;
    ctx = null;
  }
}
