import * as THREE from 'three';

let group = null;
let sheet = null;
let stickers = [];

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  // Holographic backing foil with iridescent shader
  const sheetGeo = new THREE.PlaneGeometry(2.4, 3.2);
  const sheetMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 pos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-pos.xyz);
        gl_Position = projectionMatrix * pos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec2 vUv;
      void main() {
        float fresnel = abs(dot(vNormal, vViewDir));
        float hue = fract(fresnel * 3.0 + vUv.x * 2.0 + sin(uTime * 1.5) * 0.4);
        vec3 col = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
        col = mix(vec3(0.9), col, 0.6);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });
  sheet = new THREE.Mesh(sheetGeo, sheetMat);
  group.add(sheet);

  // Die-cut stickers placed on sheet
  stickers = [];
  const shapes = [
    { type: 'star', color: 0xFFDE59, x: -0.6, y: 0.8 },
    { type: 'heart', color: 0xCF005E, x: 0.6, y: 0.8 },
    { type: 'cyber', color: 0x5CE1E6, x: -0.6, y: -0.6 },
    { type: 'logo', color: 0xBDFF52, x: 0.6, y: -0.6 }
  ];

  shapes.forEach((s) => {
    const sMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 24),
      new THREE.MeshStandardMaterial({
        color: s.color,
        metalness: 0.6,
        roughness: 0.2
      })
    );
    sMesh.position.set(s.x, s.y, 0.02);
    sheet.add(sMesh);
    stickers.push(sMesh);
  });

  scene.add(group);
  return group;
}

export function update(delta, time, isFocused, reducedMotion) {
  if (!group) return;
  if (sheet && sheet.material.uniforms) {
    sheet.material.uniforms.uTime.value = time;
  }
  if (!reducedMotion) {
    group.rotation.y = Math.sin(time * 1.2) * 0.4;
    group.rotation.x = Math.cos(time * 0.9) * 0.2;
  }
}

export function setFocus(focused) {}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    group = null;
    sheet = null;
    stickers = [];
  }
}
