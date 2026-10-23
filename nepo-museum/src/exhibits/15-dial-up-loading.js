import * as THREE from 'three';

let group = null;
let screenMesh = null;
let canvas = null;
let ctx = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  // Black CRT monitor housing
  const crt = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 2.4, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.6 })
  );
  group.add(crt);

  // Monitor screen canvas
  canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  ctx = canvas.getContext('2d');
  drawDialUp(0);

  const tex = new THREE.CanvasTexture(canvas);
  const sGeo = new THREE.PlaneGeometry(2.2, 1.7);
  const sMat = new THREE.MeshBasicMaterial({ map: tex });
  screenMesh = new THREE.Mesh(sGeo, sMat);
  screenMesh.position.set(0, 0, 1.01);
  group.add(screenMesh);

  scene.add(group);
  return group;
}

function drawDialUp(time) {
  if (!ctx) return;
  // Dark CRT background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 384);

  // Scanlines in Brand Lime
  ctx.fillStyle = 'rgba(189, 255, 82, 0.12)';
  for (let y = 0; y < 384; y += 4) {
    ctx.fillRect(0, y, 512, 2);
  }

  // Dial-up Terminal text
  ctx.fillStyle = '#5CE1E6';
  ctx.font = 'bold 20px "SF Mono", "Space Mono", monospace';
  ctx.fillText('DIAL-UP INTERNET V.90 56K', 30, 50);

  ctx.fillStyle = '#BDFF52';
  ctx.font = '14px "SF Mono", "Space Mono", monospace';
  ctx.fillText('ATDT 1-800-NEPO-WEB', 30, 90);
  ctx.fillText('CONNECT 56000/ARQ/V90/LAPM', 30, 120);

  // Audio handshake waveform simulation
  ctx.strokeStyle = '#FFDE59';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < 450; x += 5) {
    const wave = Math.sin(x * 0.05 + time * 10) * Math.cos(x * 0.02) * 30;
    if (x === 0) ctx.moveTo(30 + x, 200 + wave);
    else ctx.lineTo(30 + x, 200 + wave);
  }
  ctx.stroke();

  // Progressive image download bar
  ctx.fillStyle = '#CF005E';
  const loadProgress = ((time * 0.3) % 1) * 450;
  ctx.fillRect(30, 280, loadProgress, 20);
  ctx.strokeRect(30, 280, 450, 20);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px monospace';
  ctx.fillText(`RECEIVING PACKETS... ${Math.floor((loadProgress / 450) * 100)}%`, 30, 330);
}

export function update(delta, time) {
  if (!group) return;
  drawDialUp(time);
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
