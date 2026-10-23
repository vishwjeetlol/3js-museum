import * as THREE from 'three';

export function createRopes(scene, exhibitsData) {
  const ropesGroup = new THREE.Group();

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xFFDE59,
    metalness: 0.85,
    roughness: 0.2
  });

  const velvetMat = new THREE.MeshStandardMaterial({
    color: 0xCF005E,
    roughness: 0.8
  });

  function createStanchion(x, z) {
    const postGroup = new THREE.Group();
    postGroup.position.set(x, 0, z);

    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.1, 16), brassMat);
    base.position.y = 0.05;
    postGroup.add(base);

    // Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 16), brassMat);
    pole.position.y = 0.65;
    postGroup.add(pole);

    // Finial sphere
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), brassMat);
    finial.position.y = 1.3;
    postGroup.add(finial);

    return postGroup;
  }

  function createVelvetSwag(p1, p2) {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p1.x, 1.15, p1.z),
      new THREE.Vector3((p1.x + p2.x) / 2, 0.75, (p1.z + p2.z) / 2),
      new THREE.Vector3(p2.x, 1.15, p2.z)
    );

    const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.04, 8, false);
    return new THREE.Mesh(tubeGeo, velvetMat);
  }

  exhibitsData.forEach((ex) => {
    // 2 stanchions in front of each plinth
    const p1 = { x: ex.position.x - 2.5, z: ex.position.z + 3.0 };
    const p2 = { x: ex.position.x + 2.5, z: ex.position.z + 3.0 };

    ropesGroup.add(createStanchion(p1.x, p1.z));
    ropesGroup.add(createStanchion(p2.x, p2.z));
    ropesGroup.add(createVelvetSwag(p1, p2));
  });

  scene.add(ropesGroup);
  return ropesGroup;
}
