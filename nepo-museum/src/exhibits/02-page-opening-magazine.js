import * as THREE from 'three';

let group = null;
let leftCover = null;
let rightCover = null;
let openAngle = 0;
let targetAngle = Math.PI * 0.7;

export function init(scene, plinthPos) {
  group = new THREE.Group();
  group.position.set(plinthPos.x, plinthPos.y + 2.8, plinthPos.z);

  const coverGeo = new THREE.BoxGeometry(1.6, 2.4, 0.05);
  const leftMat = new THREE.MeshStandardMaterial({ color: 0xCF005E, roughness: 0.2 });
  const rightMat = new THREE.MeshStandardMaterial({ color: 0x5CE1E6, roughness: 0.2 });

  // Left cover hinged at x=0
  const leftPivot = new THREE.Group();
  leftCover = new THREE.Mesh(coverGeo, leftMat);
  leftCover.position.set(-0.8, 0, 0);
  leftPivot.add(leftCover);
  group.add(leftPivot);

  // Right cover hinged at x=0
  const rightPivot = new THREE.Group();
  rightCover = new THREE.Mesh(coverGeo, rightMat);
  rightCover.position.set(0.8, 0, 0);
  rightPivot.add(rightCover);
  group.add(rightPivot);

  group.userData.leftPivot = leftPivot;
  group.userData.rightPivot = rightPivot;

  scene.add(group);
  return group;
}

export function update(delta, time, isFocused) {
  if (!group) return;
  // Gently breathe the opening angle
  const angle = isFocused ? targetAngle : (Math.sin(time * 1.5) * 0.5 + 0.5) * Math.PI * 0.8;
  group.userData.leftPivot.rotation.y = angle / 2;
  group.userData.rightPivot.rotation.y = -angle / 2;
  group.rotation.y = Math.sin(time * 0.5) * 0.2;
}

export function setFocus(focused) {
  targetAngle = focused ? Math.PI * 0.85 : 0;
}

export function dispose(scene) {
  if (group) {
    scene.remove(group);
    if (leftCover) {
      leftCover.geometry.dispose();
      leftCover.material.dispose();
    }
    if (rightCover) {
      rightCover.geometry.dispose();
      rightCover.material.dispose();
    }
    group = null;
  }
}
