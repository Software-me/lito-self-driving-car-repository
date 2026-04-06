/** Main road slab, dashed lines, four-way intersection mesh, scenery (trees, street lamps). */
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
  /* Same scroll math as updateDashLineScroll (scroll = −car.z); car is added after buildRoad so ~start z=6. */
  const approxStartZ = 6;
  const baseNear = Number(C.DASH_LINE_BASE_NEAR) || 900;
  const baseFar = Number.isFinite(Number(C.DASH_LINE_BASE_FAR)) ? Number(C.DASH_LINE_BASE_FAR) : -24500;
  const scroll0 = -approxStartZ;
  const nearZ = baseNear + scroll0;
  const farZ = baseFar + scroll0;
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

  const zStart = Number(C.SCENERY_Z_START) || 250;
  const zEnd = Number.isFinite(Number(C.SCENERY_Z_END)) ? Number(C.SCENERY_Z_END) : -11000;
  const treeSpacing = 42;
  /* Fallback if static import/cache serves an old config without these exports (avoids NaN loop → one row behind car). */
  const poleSpacing = Math.max(8, Number(C.STREET_LAMP_SPACING) || 40);
  const poolEvery = Math.max(1, Math.floor(Number(C.STREET_LAMP_POINT_LIGHT_EVERY_N)) || 10);

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

  /* Basic materials; fog:false so globes stay readable down the road (scene fog was hiding distant poles). */
  const lampPoleBasic = new THREE.MeshBasicMaterial({ color: 0x5a5a64, fog: false });
  const lampHeadBasic = new THREE.MeshBasicMaterial({ color: 0xfff2b8, fog: false });

  function addStreetLamp(worldX, z, towardCenterSign, withGroundPool) {
    const armLen = 2.15;
    const armY = 5.05;
    const g = new THREE.Group();
    g.frustumCulled = false;
    g.position.set(worldX, 0, z);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 5.4, 8), lampPoleBasic);
    stem.frustumCulled = false;
    stem.position.y = 2.7;
    stem.castShadow = false;

    const arm = new THREE.Mesh(new THREE.BoxGeometry(armLen, 0.14, 0.16), lampPoleBasic);
    arm.frustumCulled = false;
    arm.position.set(towardCenterSign * (armLen * 0.5 + 0.06), armY, 0);
    arm.castShadow = false;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), lampHeadBasic);
    head.frustumCulled = false;
    head.position.set(towardCenterSign * (armLen + 0.12), armY, 0);
    head.castShadow = false;

    g.add(stem, arm, head);

    if (withGroundPool) {
      /* decay optional in older three builds; distance + intensity give the warm pool. */
      const bulb = new THREE.PointLight(0xffcc88, 0.36, 58);
      bulb.decay = 2;
      bulb.position.copy(head.position);
      g.add(bulb);
    }

    W.scene.add(g);
  }

  const leftX = -14 - 2.5;
  const rightX = 7 + 2.5;
  /** Caps real-time point lights so mobile GPUs don’t hit shader/uniform limits (poles stay mesh-only). */
  let streetPoolBulbs = 0;
  const maxStreetPoolBulbs = 16;
  let lampRow = 0;
  for (let z = zStart; z > zEnd; z -= poleSpacing) {
    const poolThisRow =
      lampRow % poolEvery === 0 && streetPoolBulbs < maxStreetPoolBulbs;
    /* One bulb per sparse row (left pole only) halves light count; right pole is still a bright mesh. */
    addStreetLamp(leftX, z, 1, poolThisRow);
    if (poolThisRow) streetPoolBulbs++;
    addStreetLamp(rightX, z, -1, false);
    lampRow++;
  }
}

/**
 * Slide lane dashes opposite to car motion: z = BASE + scroll, scroll = −car.z (endpoints drift +Z as car drives −Z).
 */
export function updateDashLineScroll() {
  const car = W.car;
  if (!car) return;
  const y = 0.06;
  const scroll = -car.position.z;
  const baseNear = Number(C.DASH_LINE_BASE_NEAR) || 900;
  const baseFar = Number.isFinite(Number(C.DASH_LINE_BASE_FAR)) ? Number(C.DASH_LINE_BASE_FAR) : -24500;
  const zRear = baseNear + scroll;
  const zFwd = baseFar + scroll;

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
      pos.setXYZ(0, x, y, zRear);
      pos.setXYZ(1, x, y, zFwd);
      pos.needsUpdate = true;
      line.geometry.computeBoundingSphere();
    }
    line.computeLineDistances();
  }
}
