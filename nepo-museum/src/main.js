import * as THREE from 'three';
import exhibitsData from './data/exhibits.json';
import { createMuseumScene } from './museum/scene.js';
import { createArchitecture } from './museum/architecture.js';
import { createPlinths } from './museum/plinths.js';
import { createRopes } from './museum/ropes.js';

// Dynamic Exhibit Module Registry
const exhibitModules = import.meta.glob('./exhibits/*.js');

// Global State
const initialReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  mode: 'walk', // 'walk' | 'focus' | 'fallback'
  currentExhibitIndex: -1, // -1 is Lobby
  scrollProgress: 0,
  targetScrollProgress: 0,
  reducedMotion: initialReducedMotion,
  giftShopOpen: true,
  fps: 60,
  drawCalls: 0
};

// Canvas & Scene Init
const canvas = document.getElementById('webgl-canvas');
const { scene, camera, renderer } = createMuseumScene(canvas);

// Museum Decor
createArchitecture(scene);
const plinthsGroup = createPlinths(scene, exhibitsData);
createRopes(scene, exhibitsData);

// Active Exhibit Instances Map: id -> { module, instance }
const activeExhibits = new Map();

// Build Camera Spline Path through the Museum
// Path points: Lobby (0, 3.2, 10), then passing each exhibit, to Gift Shop (0, 3.2, -455)
const splinePoints = [
  new THREE.Vector3(0, 3.2, 10), // Lobby entrance
  new THREE.Vector3(0, 3.2, 0),  // Lobby rotunda
];

exhibitsData.forEach((ex) => {
  // Camera stands slightly offset from plinth to view it clearly
  const camX = ex.position.x > 0 ? ex.position.x - 4.5 : ex.position.x + 4.5;
  splinePoints.push(new THREE.Vector3(camX, 3.2, ex.position.z + 5.0));
});

splinePoints.push(
  new THREE.Vector3(0, 3.2, -430), // Portal to Gift Shop
  new THREE.Vector3(0, 3.2, -455)  // Gift shop center
);

const cameraCurve = new THREE.CatmullRomCurve3(splinePoints);
cameraCurve.curveType = 'catmullrom';
cameraCurve.tension = 0.5;

// Focus Mode Orbit State
let orbitCenter = new THREE.Vector3();
let orbitAzimuth = 0; // horizontal angle
let orbitElevation = 0.15; // vertical angle (pitch)
let orbitRadius = 5.5; // distance from center
let focusCamPos = new THREE.Vector3();
let focusCamLookAt = new THREE.Vector3();
let originalCamPos = new THREE.Vector3();

function updateFocusCamPos() {
  const cosElev = Math.cos(orbitElevation);
  focusCamPos.set(
    orbitCenter.x + orbitRadius * Math.sin(orbitAzimuth) * cosElev,
    orbitCenter.y + orbitRadius * Math.sin(orbitElevation),
    orbitCenter.z + orbitRadius * Math.cos(orbitAzimuth) * cosElev
  );
  focusCamLookAt.copy(orbitCenter);
}

// UI Elements
const hudPlaqueNum = document.getElementById('hud-plaque-num');
const hudExhibitTitle = document.getElementById('hud-exhibit-title');
const hudExhibitDesc = document.getElementById('hud-exhibit-desc');
const btnTestIt = document.getElementById('btn-test-it');
const focusOverlay = document.getElementById('focus-overlay');
const btnExitFocus = document.getElementById('btn-exit-focus');
const focusTitle = document.getElementById('focus-title');
const focusWing = document.getElementById('focus-wing');
const focusInstCard = document.getElementById('focus-instructions-card');
const focusInstText = document.getElementById('focus-inst-text');
const btnHideInstructions = document.getElementById('btn-hide-instructions');
const btnShowInstructions = document.getElementById('btn-show-instructions');
const focusCustomControls = document.getElementById('focus-custom-controls');
const focusFps = document.getElementById('focus-fps');
const minimapModal = document.getElementById('minimap-modal');
const minimapItems = document.getElementById('minimap-items');
const btnMinimap = document.getElementById('btn-minimap');
const btnCloseMinimap = document.getElementById('btn-close-minimap');
const giftShopDrawer = document.getElementById('gift-shop-drawer');
const btnGiftShop = document.getElementById('btn-gift-shop');
const btnCloseGiftShop = document.getElementById('btn-close-gift-shop');
const shopBanner = document.getElementById('shop-banner');
const btnToggleShopState = document.getElementById('btn-toggle-shop-state');
const fallbackView = document.getElementById('fallback-view');
const btnFallback = document.getElementById('btn-fallback');
const btnCloseFallback = document.getElementById('btn-close-fallback');
const fallbackGrid = document.getElementById('fallback-grid');
const btnReducedMotion = document.getElementById('btn-reduced-motion');

// Instructions Card Toggle [H]
function toggleInstructions(forceShow) {
  const isHidden = focusInstCard.style.display === 'none';
  const show = forceShow !== undefined ? forceShow : isHidden;
  focusInstCard.style.display = show ? 'block' : 'none';
  if (btnShowInstructions) {
    btnShowInstructions.style.display = show ? 'none' : 'inline-block';
  }
}

if (btnHideInstructions) {
  btnHideInstructions.addEventListener('click', () => toggleInstructions(false));
}
if (btnShowInstructions) {
  btnShowInstructions.addEventListener('click', () => toggleInstructions(true));
}

// Populate Minimap
exhibitsData.forEach((ex, idx) => {
  const item = document.createElement('div');
  item.className = 'minimap-item';
  item.innerHTML = `<span>№ ${String(ex.number).padStart(2, '0')} ${ex.title}</span><span style="color:var(--brand-yellow);">WING ${ex.wing}</span>`;
  item.addEventListener('click', () => {
    jumpToExhibit(idx);
    minimapModal.classList.remove('open');
  });
  minimapItems.appendChild(item);
});

// Populate Fallback Grid
exhibitsData.forEach((ex, idx) => {
  const card = document.createElement('div');
  card.className = 'fallback-card';
  card.innerHTML = `
    <div>
      <span style="font-family:var(--font-sf-mono); font-size:12px; background:var(--brand-pink); color:#FFF; padding:2px 8px;">№ ${String(ex.number).padStart(2, '0')} • WING ${ex.wing}</span>
      <h3 style="font-family:var(--font-bootzy); font-size:18px; margin:10px 0 6px 0;">${ex.title}</h3>
      <p style="font-size:12px; color:var(--brand-pink); font-family:var(--font-sf-mono); margin-bottom:8px;"><strong>Medium:</strong> ${ex.medium}</p>
      <p style="font-size:13px; line-height:1.4; margin-bottom:12px;">${ex.instructions}</p>
    </div>
    <button class="btn-y2k btn-green" style="width:100%;">LAUNCH 3D FOCUS</button>
  `;
  card.querySelector('button').addEventListener('click', () => {
    fallbackView.classList.remove('open');
    jumpToExhibit(idx);
    enterFocusMode(idx);
  });
  fallbackGrid.appendChild(card);
});

// Scroll Sync Helper
function syncScrollToTarget() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: state.targetScrollProgress * maxScroll, behavior: 'auto' });
}

// Native Scroll Listener
window.addEventListener('scroll', () => {
  if (state.mode === 'focus') return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0) {
    state.targetScrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  }
});

// Keyboard State Tracker for continuous WASD / Arrow control
const keysPressed = {};
let debounceTimer = null;

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keysPressed[k] = true;

  if (e.key === 'Escape' && state.mode === 'focus') {
    exitFocusMode();
  } else if (e.key === 'Enter' && state.mode === 'walk' && state.currentExhibitIndex >= 0) {
    enterFocusMode(state.currentExhibitIndex);
  } else if ((e.key === 'h' || e.key === 'H') && state.mode === 'focus') {
    toggleInstructions();
  } else if (e.key === 'm' || e.key === 'M') {
    minimapModal.classList.toggle('open');
  } else if (e.key === 'g' || e.key === 'G') {
    giftShopDrawer.classList.toggle('open');
  } else if (state.mode === 'focus') {
    // Discrete Arrow key handling in focus mode
    const curEx = exhibitsData[state.currentExhibitIndex];
    if (curEx && curEx.id === '07-apple-carplay') {
      const active = activeExhibits.get(curEx.id);
      if (active && active.module.stepCover) {
        if (e.key === 'ArrowLeft') active.module.stepCover(-1);
        if (e.key === 'ArrowRight') active.module.stepCover(1);
      }
    }
  }
});

window.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

// UI Button Handlers
btnTestIt.addEventListener('click', () => {
  if (state.currentExhibitIndex >= 0) {
    enterFocusMode(state.currentExhibitIndex);
  }
});

btnExitFocus.addEventListener('click', () => {
  exitFocusMode();
});

btnMinimap.addEventListener('click', () => minimapModal.classList.toggle('open'));
btnCloseMinimap.addEventListener('click', () => minimapModal.classList.remove('open'));

btnGiftShop.addEventListener('click', () => giftShopDrawer.classList.toggle('open'));
btnCloseGiftShop.addEventListener('click', () => giftShopDrawer.classList.remove('open'));

btnToggleShopState.addEventListener('click', () => {
  state.giftShopOpen = !state.giftShopOpen;
  if (state.giftShopOpen) {
    shopBanner.className = 'shop-state-banner shop-open';
    shopBanner.textContent = '● SALES OPEN: LIMITED EDITION RUN LIVE';
  } else {
    shopBanner.className = 'shop-state-banner shop-closed';
    shopBanner.textContent = '■ SALES CLOSED: ARCHIVE EXHIBIT ONLY';
  }
});

btnFallback.addEventListener('click', () => fallbackView.classList.add('open'));
btnCloseFallback.addEventListener('click', () => fallbackView.classList.remove('open'));

btnReducedMotion.addEventListener('click', () => {
  state.reducedMotion = !state.reducedMotion;
  document.body.classList.toggle('reduced-motion', state.reducedMotion);
  btnReducedMotion.textContent = state.reducedMotion ? 'MOTION: STEPWISE' : 'MOTION: SMOOTH';
});

// Mouse Orbit & Wheel Controls on Canvas
let isPointerDragging = false;
let pointerStartX = 0;
let pointerStartY = 0;
let dragDistance = 0;

canvas.addEventListener('pointerdown', (e) => {
  isPointerDragging = true;
  pointerStartX = e.clientX;
  pointerStartY = e.clientY;
  dragDistance = 0;
});

window.addEventListener('pointermove', (e) => {
  if (!isPointerDragging) return;
  const dx = e.clientX - pointerStartX;
  const dy = e.clientY - pointerStartY;
  dragDistance += Math.abs(dx) + Math.abs(dy);
  pointerStartX = e.clientX;
  pointerStartY = e.clientY;

  if (state.mode === 'focus') {
    orbitAzimuth -= dx * 0.007;
    orbitElevation = Math.max(-1.3, Math.min(1.3, orbitElevation + dy * 0.007));
    updateFocusCamPos();
  }
});

window.addEventListener('pointerup', () => {
  isPointerDragging = false;
});

canvas.addEventListener('wheel', (e) => {
  if (state.mode === 'focus') {
    e.preventDefault();
    orbitRadius = Math.max(1.8, Math.min(16.0, orbitRadius + e.deltaY * 0.006));
    updateFocusCamPos();
  }
}, { passive: false });

// Raycasting for Direct Canvas Clicks (Walk Mode to Focus, Focus Mode object interaction)
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();

canvas.addEventListener('click', (event) => {
  // If user was dragging camera orbit, don't trigger click action
  if (dragDistance > 6) return;

  const rect = canvas.getBoundingClientRect();
  mouseVec.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseVec.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouseVec, camera);

  if (state.mode === 'walk') {
    // Check if clicked any plinth or exhibit
    const intersects = raycaster.intersectObjects(scene.children, true);
    for (const hit of intersects) {
      let obj = hit.object;
      while (obj && obj !== scene) {
        if (obj.userData && obj.userData.exhibitIndex !== undefined) {
          jumpToExhibit(obj.userData.exhibitIndex);
          enterFocusMode(obj.userData.exhibitIndex);
          return;
        }
        obj = obj.parent;
      }
    }
  } else if (state.mode === 'focus') {
    // Deliver click to active exhibit handler if implemented
    const curEx = exhibitsData[state.currentExhibitIndex];
    if (curEx) {
      const active = activeExhibits.get(curEx.id);
      if (active && active.module.handleClick) {
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          active.module.handleClick(intersects[0].object);
        }
      }
    }
  }
});

// Jump helper
function jumpToExhibit(index) {
  if (index < 0) {
    // Lobby
    window.scrollTo({ top: 0, behavior: state.reducedMotion ? 'auto' : 'smooth' });
    state.targetScrollProgress = 0;
    return;
  }
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const targetP = (index + 1) / (exhibitsData.length + 1);
  state.targetScrollProgress = targetP;
  window.scrollTo({ top: targetP * maxScroll, behavior: state.reducedMotion ? 'auto' : 'smooth' });
}

// Setup Contextual Interactive Action Buttons for Exhibit
function setupFocusCustomControls(ex) {
  if (!focusCustomControls) return;
  focusCustomControls.innerHTML = '';

  const active = activeExhibits.get(ex.id);

  if (ex.id === '07-apple-carplay') {
    const btnPrev = document.createElement('button');
    btnPrev.className = 'btn-y2k btn-aqua';
    btnPrev.textContent = '◀ PREV COVER [← / A]';
    btnPrev.addEventListener('click', () => {
      if (active && active.module.stepCover) active.module.stepCover(-1);
    });

    const btnNext = document.createElement('button');
    btnNext.className = 'btn-y2k btn-green';
    btnNext.textContent = 'NEXT COVER [→ / D] ▶';
    btnNext.addEventListener('click', () => {
      if (active && active.module.stepCover) active.module.stepCover(1);
    });

    focusCustomControls.appendChild(btnPrev);
    focusCustomControls.appendChild(btnNext);
  } else if (ex.id === '01-rotating-magazine') {
    const btnAuto = document.createElement('button');
    btnAuto.className = 'btn-y2k btn-yellow';
    btnAuto.textContent = 'TOGGLE 360° AUTO-SPIN';
    btnAuto.addEventListener('click', () => {
      if (active && active.module.toggleAutoSpin) active.module.toggleAutoSpin();
    });
    focusCustomControls.appendChild(btnAuto);
  } else if (ex.id === '06-gashapon-dispenser') {
    const btnTwist = document.createElement('button');
    btnTwist.className = 'btn-y2k btn-yellow';
    btnTwist.textContent = 'TWIST CRANK [DISPENSE]';
    btnTwist.addEventListener('click', () => {
      if (active && active.module.crankTwist) active.module.crankTwist();
    });
    focusCustomControls.appendChild(btnTwist);
  } else if (ex.id === '08-photo-booth') {
    const btnSnap = document.createElement('button');
    btnSnap.className = 'btn-y2k btn-pink';
    btnSnap.textContent = 'SNAP PHOTO [STROBE FLASH]';
    btnSnap.addEventListener('click', () => {
      if (active && active.module.triggerFlash) active.module.triggerFlash();
    });
    focusCustomControls.appendChild(btnSnap);
  } else if (ex.id === '18-flip-phone-t9') {
    const btnFlip = document.createElement('button');
    btnFlip.className = 'btn-y2k btn-aqua';
    btnFlip.textContent = 'FLIP OPEN / CLOSE';
    btnFlip.addEventListener('click', () => {
      if (active && active.module.toggleFlip) active.module.toggleFlip();
    });
    focusCustomControls.appendChild(btnFlip);
  } else if (ex.id === '19-mixtape-boombox') {
    const btnPlay = document.createElement('button');
    btnPlay.className = 'btn-y2k btn-green';
    btnPlay.textContent = 'PLAY / EJECT TAPE';
    btnPlay.addEventListener('click', () => {
      if (active && active.module.togglePlay) active.module.togglePlay();
    });
    focusCustomControls.appendChild(btnPlay);
  }
}

// Focus Mode Switching
async function enterFocusMode(index) {
  const ex = exhibitsData[index];
  if (!ex) return;

  state.mode = 'focus';
  originalCamPos.copy(camera.position);

  // Set Orbit Center and Radius based on exhibit footprint
  orbitCenter.set(ex.position.x, ex.position.y + 2.5, ex.position.z);
  orbitAzimuth = 0;
  orbitElevation = 0.15;
  orbitRadius = (ex.number === 11 || ex.number === 14) ? 7.5 : (ex.number === 12 || ex.number === 13) ? 8.5 : 5.2;
  updateFocusCamPos();

  // Update HUD
  focusTitle.textContent = `EXHIBIT № ${String(ex.number).padStart(2, '0')}: ${ex.title.toUpperCase()}`;
  focusWing.textContent = `WING ${ex.wing} • ${ex.medium.toUpperCase()}`;
  focusInstText.textContent = ex.instructions;
  toggleInstructions(true); // reset to visible when entering focus mode
  focusOverlay.classList.add('active');

  // Load exhibit if not already active
  const active = activeExhibits.get(ex.id);
  if (active && active.module.setFocus) {
    active.module.setFocus(true);
  } else {
    const path = `./exhibits/${ex.id}.js`;
    if (exhibitModules[path]) {
      const mod = await exhibitModules[path]();
      const instance = mod.init(scene, ex.position);
      if (instance) {
        instance.userData = instance.userData || {};
        instance.userData.exhibitIndex = index;
        instance.userData.exhibitId = ex.id;
      }
      activeExhibits.set(ex.id, { module: mod, instance });
      if (mod.setFocus) mod.setFocus(true);
    }
  }

  setupFocusCustomControls(ex);
}

function exitFocusMode() {
  if (state.currentExhibitIndex >= 0) {
    const ex = exhibitsData[state.currentExhibitIndex];
    const active = activeExhibits.get(ex.id);
    if (active && active.module.setFocus) {
      active.module.setFocus(false);
    }
  }
  state.mode = 'walk';
  focusOverlay.classList.remove('active');
}

// Distance-Based Lifecycle Manager (15m threshold)
const ACTIVATION_RADIUS = 28.0; // Three.js units (~15-20 meters)

async function manageExhibitLifecycle(camPosition) {
  for (let idx = 0; idx < exhibitsData.length; idx++) {
    const ex = exhibitsData[idx];
    const plinthVec = new THREE.Vector3(ex.position.x, ex.position.y, ex.position.z);
    const dist = camPosition.distanceTo(plinthVec);

    const isNear = dist <= ACTIVATION_RADIUS;
    const isLoaded = activeExhibits.has(ex.id);

    if (isNear && !isLoaded) {
      // Load module & initialize
      const path = `./exhibits/${ex.id}.js`;
      if (exhibitModules[path]) {
        const mod = await exhibitModules[path]();
        const instance = mod.init(scene, ex.position);
        if (instance) {
          instance.userData = instance.userData || {};
          instance.userData.exhibitIndex = idx;
          instance.userData.exhibitId = ex.id;
        }
        activeExhibits.set(ex.id, { module: mod, instance });
      }
    } else if (!isNear && isLoaded && state.mode !== 'focus') {
      // Far away: dispose resources
      const active = activeExhibits.get(ex.id);
      if (active && active.module.dispose) {
        active.module.dispose(scene);
      }
      activeExhibits.delete(ex.id);
    }
  }
}

// Main Animation Loop
let lastTime = performance.now();
let frameCount = 0;
let lastFpsUpdate = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);

  const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;
  const time = currentTime * 0.001;

  // FPS Telemetry
  frameCount++;
  if (currentTime - lastFpsUpdate >= 500) {
    state.fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
    frameCount = 0;
    lastFpsUpdate = currentTime;
    state.drawCalls = renderer.info.render.calls;
    focusFps.textContent = `FPS: ${state.fps} • CALLS: ${state.drawCalls} • ACTIVE: ${activeExhibits.size}`;
  }

  // Camera & Movement Management
  if (state.mode === 'walk') {
    // WASD & Arrow Key Navigation in Walk Mode
    const walkSpeed = 0.12 * (state.reducedMotion ? 2.5 : 1.0);
    let scrollChanged = false;

    if (keysPressed['w'] || keysPressed['arrowup']) {
      state.targetScrollProgress = Math.min(1, state.targetScrollProgress + delta * walkSpeed);
      scrollChanged = true;
    }
    if (keysPressed['s'] || keysPressed['arrowdown']) {
      state.targetScrollProgress = Math.max(0, state.targetScrollProgress - delta * walkSpeed);
      scrollChanged = true;
    }
    if (scrollChanged) {
      syncScrollToTarget();
    }

    // Step to prev/next exhibit with A / D
    if (keysPressed['a'] || keysPressed['arrowleft']) {
      if (!debounceTimer) {
        jumpToExhibit(Math.max(-1, state.currentExhibitIndex - 1));
        debounceTimer = setTimeout(() => { debounceTimer = null; }, 300);
      }
    }
    if (keysPressed['d'] || keysPressed['arrowright']) {
      if (!debounceTimer) {
        jumpToExhibit(Math.min(exhibitsData.length - 1, state.currentExhibitIndex + 1));
        debounceTimer = setTimeout(() => { debounceTimer = null; }, 300);
      }
    }

    // Smooth interpolation to target scroll progress
    const lerpSpeed = state.reducedMotion ? 1.0 : 0.08;
    state.scrollProgress += (state.targetScrollProgress - state.scrollProgress) * lerpSpeed;

    const t = Math.max(0, Math.min(1, state.scrollProgress));
    const point = cameraCurve.getPointAt(t);
    const tangent = cameraCurve.getTangentAt(Math.min(0.999, t));
    const lookAtPoint = point.clone().add(tangent.multiplyScalar(6));

    camera.position.copy(point);
    camera.lookAt(lookAtPoint);

    // Dynamic ceiling track spotlights track camera
    if (plinthsGroup.userData && plinthsGroup.userData.activeSpotL) {
      plinthsGroup.userData.activeSpotL.position.set(-6, 12, point.z);
      plinthsGroup.userData.activeSpotL.target.position.set(-2, 1, point.z - 10);
      plinthsGroup.userData.activeSpotR.position.set(6, 12, point.z);
      plinthsGroup.userData.activeSpotR.target.position.set(2, 1, point.z - 10);
    }

    // Identify closest exhibit to camera
    let closestIndex = -1;
    let minDist = 18;

    exhibitsData.forEach((ex, idx) => {
      const plinthVec = new THREE.Vector3(ex.position.x, ex.position.y, ex.position.z);
      const d = camera.position.distanceTo(plinthVec);
      if (d < minDist) {
        minDist = d;
        closestIndex = idx;
      }
    });

    if (closestIndex !== state.currentExhibitIndex) {
      state.currentExhibitIndex = closestIndex;
      if (closestIndex >= 0) {
        const ex = exhibitsData[closestIndex];
        hudPlaqueNum.textContent = `№ ${String(ex.number).padStart(2, '0')}`;
        hudExhibitTitle.textContent = `${ex.title.toUpperCase()} (WING ${ex.wing})`;
        hudExhibitDesc.textContent = ex.instructions;
        btnTestIt.style.display = 'inline-block';
      } else {
        hudPlaqueNum.textContent = `№ 00`;
        hudExhibitTitle.textContent = `GRAND ROTUNDA LOBBY`;
        hudExhibitDesc.textContent = `Scroll or press W/S / Arrows to walk through Wing A, B, C and the Gift Shop.`;
        btnTestIt.style.display = 'none';
      }
    }
  } else if (state.mode === 'focus') {
    // WASD Camera Controls in Focus Mode
    let camChanged = false;
    const curEx = exhibitsData[state.currentExhibitIndex];
    const isCoverFlow = curEx && curEx.id === '07-apple-carplay';

    // A / D: If Cover Flow, step sleeves; otherwise orbit horizontally
    if (keysPressed['a']) {
      if (isCoverFlow) {
        if (!debounceTimer) {
          const active = activeExhibits.get(curEx.id);
          if (active && active.module.stepCover) active.module.stepCover(-1);
          debounceTimer = setTimeout(() => { debounceTimer = null; }, 220);
        }
      } else {
        orbitAzimuth += delta * 2.2;
        camChanged = true;
      }
    }
    if (keysPressed['d']) {
      if (isCoverFlow) {
        if (!debounceTimer) {
          const active = activeExhibits.get(curEx.id);
          if (active && active.module.stepCover) active.module.stepCover(1);
          debounceTimer = setTimeout(() => { debounceTimer = null; }, 220);
        }
      } else {
        orbitAzimuth -= delta * 2.2;
        camChanged = true;
      }
    }

    // W / S: Zoom in / out
    if (keysPressed['w']) {
      orbitRadius = Math.max(1.8, orbitRadius - delta * 4.5);
      camChanged = true;
    }
    if (keysPressed['s']) {
      orbitRadius = Math.min(16.0, orbitRadius + delta * 4.5);
      camChanged = true;
    }

    // Up / Down arrow: Pitch elevation
    if (keysPressed['arrowup']) {
      orbitElevation = Math.min(1.3, orbitElevation + delta * 1.8);
      camChanged = true;
    }
    if (keysPressed['arrowdown']) {
      orbitElevation = Math.max(-1.3, orbitElevation - delta * 1.8);
      camChanged = true;
    }

    if (camChanged) {
      updateFocusCamPos();
    }

    // Smooth lerp to orbit viewpoint
    camera.position.lerp(focusCamPos, 0.12);
    camera.lookAt(focusCamLookAt);
  }

  // Manage proximity allocation
  manageExhibitLifecycle(camera.position);

  // Update active exhibits
  for (const [id, active] of activeExhibits.entries()) {
    if (active.module.update) {
      const isFocused = (state.mode === 'focus' && state.currentExhibitIndex >= 0 && exhibitsData[state.currentExhibitIndex].id === id);
      active.module.update(delta, time, isFocused, state.reducedMotion);
    }
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
