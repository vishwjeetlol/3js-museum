import * as THREE from 'three';

let group = null;
let curlerMesh = null;
let curlProgress = 0;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  // High-subdivision plane for dynamic curling
  const geo = new THREE.PlaneGeometry(2.2, 3.0, 48, 48);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uCurl: { value: 0.0 },
      uColorFront: { value: new THREE.Color(0xFFDE59) },
      uColorBack: { value: new THREE.Color(0xCF005E) }
    },
    vertexShader: `
      uniform float uCurl;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        float dist = p.x + 1.1;
        float theta = dist * 2.0 * uCurl;
        p.z += sin(theta) * 0.75 * uCurl;
        p.x = -1.1 + (dist - (1.0 - cos(theta)) * 0.35 * uCurl);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorFront;
      uniform vec3 uColorBack;
      varying vec2 vUv;
      void main() {
        vec3 col = gl_FrontFacing ? uColorFront : uColorBack;
        col *= (0.75 + 0.25 * vUv.x);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });

  curlerMesh = new THREE.Mesh(geo, mat);
  group.add(curlerMesh);

  scene.add(group);
  return group;
}

export function update(delta, time, isFocused, reducedMotion) {
  if (!curlerMesh) return;
  if (!reducedMotion) {
    curlProgress = (Math.sin(time * 1.5) * 0.5 + 0.5);
    curlerMesh.material.uniforms.uCurl.value = curlProgress;
    group.rotation.y = Math.sin(time * 0.6) * 0.3;
  }
}

export function setFocus(focused) {
  // Focus enables manual inspection
}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    if (curlerMesh) {
      curlerMesh.geometry.dispose();
      curlerMesh.material.dispose();
    }
    group = null;
    curlerMesh = null;
  }
}
