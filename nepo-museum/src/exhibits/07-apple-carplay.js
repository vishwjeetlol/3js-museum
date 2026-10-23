import * as THREE from 'three';

let group = null;
let covers = [];
let activeIndex = 3;
let targetIndex = 3;
const totalCovers = 7;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.5, plinthPos.z);

  covers = [];
  const coverGeo = new THREE.PlaneGeometry(1.6, 2.0);

  // Brand Cover Artwork
  const coverPalette = [
    { title: 'ISSUE 01', col: '#CF005E', tag: 'RETRO' },
    { title: 'ISSUE 02', col: '#5CE1E6', tag: 'CYBER' },
    { title: 'ISSUE 03', col: '#BDFF52', tag: 'ACID' },
    { title: 'ISSUE 04', col: '#FFDE59', tag: 'THREE.JS' },
    { title: 'ISSUE 05', col: '#FC94C3', tag: 'DUSK' },
    { title: 'ISSUE 06', col: '#CF005E', tag: 'NEPO' },
    { title: 'ISSUE 07', col: '#BDFF52', tag: 'FUTURE' }
  ];

  for (let i = 0; i < totalCovers; i++) {
    const info = coverPalette[i];
    // Dynamic Canvas Texture for each cover
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = info.col;
    ctx.fillRect(0, 0, 256, 320);

    // Dark frame
    ctx.fillStyle = '#000000';
    ctx.fillRect(12, 12, 232, 296);

    ctx.fillStyle = info.col;
    ctx.font = '900 24px Bootzy, "Space Grotesk", Impact, sans-serif';
    ctx.fillText('NEPO BABY', 28, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 16px "SF Mono", "Space Mono", monospace';
    ctx.fillText(info.title, 28, 90);
    ctx.fillText(info.tag, 28, 115);

    // Stylized album disc art
    ctx.strokeStyle = info.col;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 200, 60, 0, Math.PI * 2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.2,
      side: THREE.DoubleSide
    });

    const coverMesh = new THREE.Mesh(coverGeo, mat);

    // Mirrored Floor Reflection Plane
    const refMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    const refMesh = new THREE.Mesh(coverGeo, refMat);
    refMesh.scale.y = -1;
    refMesh.position.y = -2.02;
    coverMesh.add(refMesh);

    coverMesh.userData = { index: i };
    group.add(coverMesh);
    covers.push(coverMesh);
  }

  // Glossy Black Mirror Floor for reflections
  const mirrorGeo = new THREE.PlaneGeometry(8.0, 4.0);
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.95,
    roughness: 0.1
  });
  const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = -1.02;
  group.add(mirror);

  updateCoverPositions(3, true);

  scene.add(group);
  return group;
}

function updateCoverPositions(targetIdx, immediate = false) {
  covers.forEach((cover, i) => {
    const offset = i - targetIdx;
    let targetX = 0;
    let targetZ = 0;
    let targetRotY = 0;

    if (offset === 0) {
      // Center active cover
      targetX = 0;
      targetZ = 0.6;
      targetRotY = 0;
    } else if (offset < 0) {
      // Left stack
      targetX = offset * 0.7 - 0.7;
      targetZ = -Math.abs(offset) * 0.3;
      targetRotY = Math.PI / 3; // ~60 degrees tilt
    } else {
      // Right stack
      targetX = offset * 0.7 + 0.7;
      targetZ = -Math.abs(offset) * 0.3;
      targetRotY = -Math.PI / 3;
    }

    if (immediate) {
      cover.position.set(targetX, 0, targetZ);
      cover.rotation.y = targetRotY;
    } else {
      cover.userData.targetX = targetX;
      cover.userData.targetZ = targetZ;
      cover.userData.targetRotY = targetRotY;
    }
  });
}

export function update(delta, time, isFocused, reducedMotion) {
  if (!group) return;

  if (isFocused) {
    // In focus mode, smooth flip transition
    covers.forEach((cover) => {
      if (cover.userData.targetX !== undefined) {
        cover.position.x += (cover.userData.targetX - cover.position.x) * delta * 8.0;
        cover.position.z += (cover.userData.targetZ - cover.position.z) * delta * 8.0;
        cover.rotation.y += (cover.userData.targetRotY - cover.rotation.y) * delta * 8.0;
      }
    });
  } else {
    // Idle gentle flow
    const idleIdx = 3 + Math.sin(time * 0.8) * 1.8;
    updateCoverPositions(idleIdx, false);
    covers.forEach((cover) => {
      if (cover.userData.targetX !== undefined) {
        cover.position.x += (cover.userData.targetX - cover.position.x) * delta * 4.0;
        cover.position.z += (cover.userData.targetZ - cover.position.z) * delta * 4.0;
        cover.rotation.y += (cover.userData.targetRotY - cover.rotation.y) * delta * 4.0;
      }
    });
  }
}

export function setFocus(focused) {
  targetIndex = 3;
  updateCoverPositions(targetIndex, false);
}

export function stepCover(direction) {
  targetIndex = Math.max(0, Math.min(totalCovers - 1, targetIndex + direction));
  updateCoverPositions(targetIndex, false);
}

export function selectCover(index) {
  if (index >= 0 && index < totalCovers) {
    targetIndex = index;
    updateCoverPositions(targetIndex, false);
  }
}

export function handleClick(mesh) {
  if (!mesh) return;
  // If mesh or its parent is one of our covers
  const found = covers.findIndex(c => c === mesh || c.children.includes(mesh));
  if (found !== -1) {
    selectCover(found);
  }
}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    covers = [];
  }
}
