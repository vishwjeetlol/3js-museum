import * as THREE from 'three';

export function createArchitecture(scene) {
  const group = new THREE.Group();

  // Create procedural checkerboard/terrazzo canvas texture
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const ctx = floorCanvas.getContext('2d');
  
  // Checkerboard pattern with subtle speckles
  const tileSize = 64;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const isEven = (x / tileSize + y / tileSize) % 2 === 0;
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, tileSize, tileSize);
      if (isEven) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }

      // Terrazzo colored specks
      for (let s = 0; s < 8; s++) {
        const sx = x + Math.random() * tileSize;
        const sy = y + Math.random() * tileSize;
        const colors = ['#BDFF52', '#CF005E', '#5CE1E6', '#FFDE59', '#FFFFFF'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(sx, sy, 2, 2);
      }
    }
  }

  const floorTex = new THREE.CanvasTexture(floorCanvas);
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(16, 120);

  // Main floor
  const floorGeo = new THREE.PlaneGeometry(60, 520);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.3,
    metalness: 0.1
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, 0, -230);
  group.add(floorMesh);

  // Helper to create wing wall panels
  function createWallSegment(zStart, zEnd, colorHex, wingName) {
    const length = Math.abs(zEnd - zStart);
    const zCenter = (zStart + zEnd) / 2;
    const height = 12;

    const wallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.6,
      metalness: 0.1
    });

    // Left wall
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(1, height, length), wallMat);
    wallL.position.set(-20, height / 2, zCenter);
    group.add(wallL);

    // Right wall
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(1, height, length), wallMat);
    wallR.position.set(20, height / 2, zCenter);
    group.add(wallR);

    // Baseboard neon strip (brand accent)
    const baseMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(colorHex) });
    const baseL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, length), baseMat);
    baseL.position.set(-19.4, 0.2, zCenter);
    group.add(baseL);

    const baseR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, length), baseMat);
    baseR.position.set(19.4, 0.2, zCenter);
    group.add(baseR);
  }

  // Helper for arched wing divider portals
  function createPortalArch(zPos, label, colorHex) {
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.4
    });

    // Outer frame with neon outline
    const postGeo = new THREE.BoxGeometry(2, 14, 2);
    const postL = new THREE.Mesh(postGeo, archMat);
    postL.position.set(-12, 7, zPos);
    group.add(postL);

    const postR = new THREE.Mesh(postGeo, archMat);
    postR.position.set(12, 7, zPos);
    group.add(postR);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(26, 2.5, 2), archMat);
    lintel.position.set(0, 13.5, zPos);
    group.add(lintel);

    // Neon trim outline on arch
    const trimMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(colorHex) });
    const trim = new THREE.Mesh(new THREE.BoxGeometry(26.4, 0.3, 2.2), trimMat);
    trim.position.set(0, 14.8, zPos);
    group.add(trim);
  }

  // 1. Grand Lobby (z: 20 to -15) - Neutral Dark Gallery
  createWallSegment(20, -15, 0x000000, "LOBBY");

  // Portal to Wing A
  createPortalArch(-15, "WING A: LOANS", 0xBDFF52);

  // 2. Wing A (z: -15 to -180) - Lime Green Brand Walls
  createWallSegment(-15, -180, 0xBDFF52, "WING A");

  // Portal to Wing B
  createPortalArch(-180, "WING B: MADE IN THIS CHAT", 0xCF005E);

  // 3. Wing B (z: -180 to -260) - Pink / Magenta Walls
  createWallSegment(-180, -260, 0xCF005E, "WING B");

  // Portal to Wing C
  createPortalArch(-260, "WING C: SHORTLISTED", 0x5CE1E6);

  // 4. Wing C (z: -260 to -430) - Cyber Aqua Walls
  createWallSegment(-260, -430, 0x5CE1E6, "WING C");

  // Portal to Gift Shop
  createPortalArch(-430, "GIFT SHOP & NEWSLETTER", 0xFFDE59);

  // 5. Gift Shop (z: -430 to -470) - Warm Gold / Checker
  createWallSegment(-430, -470, 0xFFDE59, "GIFT SHOP");

  // Back Wall
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(40, 14, 1),
    new THREE.MeshStandardMaterial({ color: 0x000000 })
  );
  backWall.position.set(0, 7, -470);
  group.add(backWall);

  scene.add(group);
  return group;
}
