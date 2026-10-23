import * as THREE from 'three';

let group = null;
let screenMesh = null;
let canvas = null;
let ctx = null;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  // Monitor frame
  const monitor = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 2.4, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x33333E, roughness: 0.5 })
  );
  group.add(monitor);

  // Canvas Desktop OS
  canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  ctx = canvas.getContext('2d');
  drawDesktop(0);

  const tex = new THREE.CanvasTexture(canvas);
  const sGeo = new THREE.PlaneGeometry(2.6, 2.0);
  const sMat = new THREE.MeshBasicMaterial({ map: tex });
  screenMesh = new THREE.Mesh(sGeo, sMat);
  screenMesh.position.set(0, 0, 0.21);
  group.add(screenMesh);

  scene.add(group);
  return group;
}

function drawDesktop(time) {
  if (!ctx) return;
  // Y2K Cyber Aqua desktop background
  ctx.fillStyle = '#5CE1E6';
  ctx.fillRect(0, 0, 512, 384);

  // Desktop Icons (My Computer, Nepo Player, Trash)
  const icons = [
    { name: 'My Computer', color: '#BDFF52', y: 30 },
    { name: 'Nepo Player', color: '#CF005E', y: 100 },
    { name: 'Minesweeper', color: '#FFDE59', y: 170 },
    { name: 'Trash Bin', color: '#FFFFFF', y: 240 }
  ];

  icons.forEach((ic) => {
    ctx.fillStyle = ic.color;
    ctx.fillRect(30, ic.y, 32, 32);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px monospace';
    ctx.fillText(ic.name, 20, ic.y + 46);
  });

  // Floating Window: Nepo Media Player
  const winX = 140 + Math.sin(time) * 10;
  const winY = 60 + Math.cos(time * 0.8) * 8;

  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(winX, winY, 320, 220);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(winX, winY, 320, 220);

  // Window Titlebar (Brand Pink)
  ctx.fillStyle = '#CF005E';
  ctx.fillRect(winX + 2, winY + 2, 316, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('NEPO PLAYER v2.0 - [TRACK 04.MP3]', winX + 8, winY + 18);

  // Window Close button [X]
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(winX + 295, winY + 4, 18, 18);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('X', winX + 300, winY + 17);

  // Visualizer bars inside window
  ctx.fillStyle = '#000000';
  ctx.fillRect(winX + 20, winY + 40, 280, 100);
  ctx.fillStyle = '#BDFF52';
  for (let b = 0; b < 24; b++) {
    const barHeight = Math.abs(Math.sin(time * 6 + b * 0.5)) * 80;
    ctx.fillRect(winX + 30 + b * 11, winY + 130 - barHeight, 8, barHeight);
  }

  // Taskbar at bottom
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(0, 356, 512, 28);
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeRect(0, 356, 512, 1);

  // Start button
  ctx.fillStyle = '#000000';
  ctx.fillRect(4, 360, 60, 20);
  ctx.fillStyle = '#BDFF52';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('START', 14, 374);

  // Clock in tray
  ctx.fillStyle = '#000000';
  ctx.font = '11px monospace';
  ctx.fillText('04:20 AM', 440, 374);
}

export function update(delta, time) {
  if (!group) return;
  drawDesktop(time);
  if (screenMesh && screenMesh.material.map) {
    screenMesh.material.map.needsUpdate = true;
  }
  group.rotation.y = Math.sin(time * 0.4) * 0.15;
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
