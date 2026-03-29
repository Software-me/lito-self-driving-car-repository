/** Main road slab, dashed lines, four-way intersection mesh, scenery (trees / poles). */
import { world as W } from "./world.js";
import * as C from "./config.js";

export function buildRoad() {
  const THREE = globalThis.THREE;
  W.roadRig = new THREE.Group();
  W.scene.add(W.roadRig);

  const roadMat = new THREE.MeshBasicMaterial({ color: 0x3a4556 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(84, 1600, 1, 1), roadMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(0, 0, -420);
  W.roadRig.add(plane);

  const dashMat = new THREE.LineDashedMaterial({
    color: 0xffffff,
    dashSize: 4,
    gapSize: 4,
    linewidth: 1,
  });
  /* Local Z span on the slab; Z is shifted each frame so dashes scroll while staying on roadRig. */
  const nearZ = 420;
  const farZ = -1400;
  const y = 0.06;

  function makeDashLine(x) {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y, nearZ),
      new THREE.Vector3(x, y, farZ),
    ]);
    const line = new THREE.Line(geom, dashMat);
    line.frustumCulled = false;
    line.computeLineDistances();
    W.roadRig.add(line);
    return line;
  }

  W.centerDashLine = makeDashLine(0);
  W.leftEdgeDashLine = makeDashLine(-14);
  W.rightEdgeDashLine = makeDashLine(7);
  W.leftDividerDashLine = makeDashLine(-7);
}

export function buildFourWayIntersection() {
  const THREE = globalThis.THREE;
  const g = new THREE.Group();
  const iz = C.LIGHT_STOP_Z;
  const roadMat = new THREE.MeshBasicMaterial({ color: 0x3a4556 });
  const roadMatDark = new THREE.MeshBasicMaterial({ color: 0x2f3745 });
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x3a3a3a });
  const headBoxMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

  const cross = new THREE.Mesh(new THREE.PlaneGeometry(160, 88), roadMat);
  cross.rotation.x = -Math.PI / 2;
  cross.position.set(0, 0.03, iz);
  g.add(cross);

  const patch = new THREE.Mesh(new THREE.PlaneGeometry(92, 92), roadMatDark);
  patch.rotation.x = -Math.PI / 2;
  patch.position.set(0, 0.031, iz);
  g.add(patch);

  const beamY = 4.7;
  // One signal per side at the intersection (no triple); short beam + single mast each side.
  const sideSignalX = 11.2;
  function addVerticalMast(worldX) {
    const sup = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.7, 0.22), poleMat);
    sup.position.set(worldX, beamY - 2.35, iz);
    g.add(sup);
  }
  addVerticalMast(sideSignalX);
  addVerticalMast(-sideSignalX);

  const miniBeamLen = 1.85;
  const eastBeam = new THREE.Mesh(new THREE.BoxGeometry(miniBeamLen, 0.18, 0.55), poleMat);
  eastBeam.position.set(sideSignalX, beamY, iz);
  g.add(eastBeam);
  const westBeam = new THREE.Mesh(new THREE.BoxGeometry(miniBeamLen, 0.18, 0.55), poleMat);
  westBeam.position.set(-sideSignalX, beamY, iz);
  g.add(westBeam);

  const crossMat = {
    red: new THREE.MeshBasicMaterial({ color: 0xff3333 }),
    yellow: new THREE.MeshBasicMaterial({ color: 0x333300 }),
    green: new THREE.MeshBasicMaterial({ color: 0x002200 }),
  };
  const headCenterY = 2.85;
  const bulbYOffset = 0.33;
  const bulbRadius = 0.16;
  const bulbLocalZ = 0.22;

  function addCrossStreetHead(worldX, rotationY) {
    const head = new THREE.Group();
    head.position.set(worldX, 0, iz);
    head.rotation.y = rotationY;

    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.35, 0.35), headBoxMat);
    housing.position.set(0, headCenterY, 0);
    head.add(housing);

    const red = new THREE.Mesh(new THREE.SphereGeometry(bulbRadius, 16, 16), crossMat.red);
    const yellow = new THREE.Mesh(new THREE.SphereGeometry(bulbRadius, 16, 16), crossMat.yellow);
    const green = new THREE.Mesh(new THREE.SphereGeometry(bulbRadius, 16, 16), crossMat.green);

    red.position.set(0, headCenterY + bulbYOffset, bulbLocalZ);
    yellow.position.set(0, headCenterY, bulbLocalZ);
    green.position.set(0, headCenterY - bulbYOffset, bulbLocalZ);
    head.add(red, yellow, green);
    g.add(head);
  }

  // East (+X): one head faces −X (cross traffic). West (−X): one head faces +X.
  addCrossStreetHead(sideSignalX, -Math.PI / 2);
  addCrossStreetHead(-sideSignalX, Math.PI / 2);

  const dashY = 0.045;
  const xHalf = 86;
  const crossDashMat = new THREE.LineDashedMaterial({
    color: 0xffffff,
    dashSize: 3,
    gapSize: 3,
    linewidth: 1,
  });
  function addDashAlongX(zWorld) {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-xHalf, dashY, zWorld),
      new THREE.Vector3(xHalf, dashY, zWorld),
    ]);
    const line = new THREE.Line(geom, crossDashMat);
    line.frustumCulled = false;
    line.computeLineDistances();
    g.add(line);
  }
  [-16, -8, 0, 8, 16].forEach((dz) => addDashAlongX(iz + dz));

  W.scene.add(g);
  W.intersectionGroup = g;
}

export function buildScenery() {
  const THREE = globalThis.THREE;
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9, metalness: 0.05 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8, metalness: 0 });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.3 });

  const zStart = 250;
  const zEnd = -1400;
  const treeSpacing = 42;
  const poleSpacing = 95;

  for (let z = zStart; z > zEnd; z -= treeSpacing) {
    const jitter = (z * 0.1) % 1;
    const leftOffset = 4 + jitter * 2;
    const rightOffset = 4 + (1 - jitter) * 2;
    const heightVar = 0.85 + jitter * 0.3;

    function addTree(x, zPos, scale) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 2.5 * scale, 8), trunkMat);
      trunk.position.set(x, 1.25 * scale, zPos);
      trunk.castShadow = false;
      W.scene.add(trunk);
      const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.8 * scale, 3.5 * scale, 8), foliageMat);
      foliage.position.set(x, 3.2 * scale, zPos);
      foliage.castShadow = false;
      W.scene.add(foliage);
    }

    addTree(-14 - leftOffset, z, heightVar);
    addTree(7 + rightOffset, z, heightVar);
  }

  for (let z = zStart; z > zEnd; z -= poleSpacing) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.5, 8), poleMat);
    pole.position.set(-14 - 2.5, 2.25, z);
    pole.castShadow = false;
    W.scene.add(pole);
    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.5, 8), poleMat);
    pole2.position.set(7 + 2.5, 2.25, z);
    pole2.castShadow = false;
    W.scene.add(pole2);
  }
}

/** Slide dash segments along rig local Z so markings move past the car; rig+car move together, so a fixed local segment would look frozen. */
export function updateDashLineScroll() {
  const car = W.car;
  if (!car) return;
  const y = 0.06;
  const baseNear = 420;
  const baseFar = -1400;
  const scroll = -car.position.z;

  const lines = [
    [W.centerDashLine, 0],
    [W.leftEdgeDashLine, -14],
    [W.rightEdgeDashLine, 7],
    [W.leftDividerDashLine, -7],
  ];

  for (const [line, x] of lines) {
    if (!line) continue;
    const pos = line.geometry.attributes.position;
    if (pos && pos.count >= 2) {
      pos.setXYZ(0, x, y, baseNear + scroll);
      pos.setXYZ(1, x, y, baseFar + scroll);
      pos.needsUpdate = true;
      line.geometry.computeBoundingSphere();
    }
    line.computeLineDistances();
  }
}
