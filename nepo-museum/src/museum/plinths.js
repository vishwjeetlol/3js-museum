import * as THREE from 'three';

export function createPlinths(scene, exhibitsData) {
  const plinthsGroup = new THREE.Group();

  // White plinth material
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.2,
    metalness: 0.1
  });

  // Black outline material
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide
  });

  // Glass vitrine material
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x5CE1E6,
    transparent: true,
    opacity: 0.18,
    roughness: 0.1,
    transmission: 0.85,
    thickness: 0.5
  });

  exhibitsData.forEach((ex, idx) => {
    const plinth = new THREE.Group();
    plinth.position.set(ex.position.x, ex.position.y, ex.position.z);
    plinth.userData = { exhibitId: ex.id, number: ex.number, exhibitIndex: idx };

    // Core white plinth box
    const boxGeo = new THREE.BoxGeometry(4.2, 1.8, 4.2);
    const box = new THREE.Mesh(boxGeo, plinthMat);
    box.position.y = 0.9;
    plinth.add(box);

    // Thick black outline (slightly scaled up inverted box)
    const outlineGeo = new THREE.BoxGeometry(4.35, 1.95, 4.35);
    const outline = new THREE.Mesh(outlineGeo, outlineMat);
    outline.position.y = 0.9;
    plinth.add(outline);

    // Glass vitrine cube resting on plinth (only for exhibits where hasVitrine !== false)
    if (ex.hasVitrine !== false) {
      const vitrineGeo = new THREE.BoxGeometry(3.8, 3.2, 3.8);
      const vitrine = new THREE.Mesh(vitrineGeo, glassMat);
      vitrine.position.y = 3.4;
      plinth.add(vitrine);

      // Vitrine metal edge struts
      const edgeGeo = new THREE.BoxGeometry(0.08, 3.2, 0.08);
      const edgeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const offsets = [
        [-1.88, 1.88], [1.88, 1.88], [-1.88, -1.88], [1.88, -1.88]
      ];
      offsets.forEach(([ox, oz]) => {
        const strut = new THREE.Mesh(edgeGeo, edgeMat);
        strut.position.set(ox, 3.4, oz);
        plinth.add(strut);
      });
    }

    // Circular spotlight floor puddle
    const ringGeo = new THREE.RingGeometry(1.6, 2.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ex.wing === 'A' ? 0xBDFF52 : ex.wing === 'B' ? 0xCF005E : 0x5CE1E6,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.02, 0);
    plinth.add(ring);

    // Number plaque on front face of plinth
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 256;
    plaqueCanvas.height = 128;
    const pCtx = plaqueCanvas.getContext('2d');
    pCtx.fillStyle = '#000000';
    pCtx.fillRect(0, 0, 256, 128);
    pCtx.fillStyle = '#FFFFFF';
    pCtx.fillRect(4, 4, 248, 120);
    pCtx.fillStyle = '#000000';
    pCtx.font = 'bold 24px monospace';
    pCtx.fillText(`№ ${String(ex.number).padStart(2, '0')}`, 16, 40);
    pCtx.font = 'bold 18px sans-serif';
    pCtx.fillText(ex.title.substring(0, 18), 16, 75);
    const wingBadgeColor = ex.wing === 'A' ? '#BDFF52' : ex.wing === 'B' ? '#CF005E' : '#5CE1E6';
    pCtx.fillStyle = wingBadgeColor;
    pCtx.fillRect(16, 90, 100, 24);
    pCtx.fillStyle = ex.wing === 'B' ? '#FFFFFF' : '#000000';
    pCtx.font = 'bold 14px monospace';
    pCtx.fillText(`WING ${ex.wing}`, 24, 107);

    const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
    const plaqueMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.7),
      new THREE.MeshBasicMaterial({ map: plaqueTex })
    );
    plaqueMesh.position.set(0, 1.0, 2.12);
    plinth.add(plaqueMesh);

    plinthsGroup.add(plinth);
  });

  // 2 Dynamic Gallery Track Spotlights that follow the visitor's focus
  const activeSpotL = new THREE.SpotLight(0xFFFFFF, 4.0, 35, Math.PI / 4, 0.4, 1);
  activeSpotL.position.set(-6, 12, 10);
  plinthsGroup.add(activeSpotL);

  const activeSpotR = new THREE.SpotLight(0xFFFFFF, 4.0, 35, Math.PI / 4, 0.4, 1);
  activeSpotR.position.set(6, 12, 10);
  plinthsGroup.add(activeSpotR);

  plinthsGroup.userData = { activeSpotL, activeSpotR };

  scene.add(plinthsGroup);
  return plinthsGroup;
}
